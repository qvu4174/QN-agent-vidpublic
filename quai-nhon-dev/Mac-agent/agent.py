#!/usr/bin/env python3

import json
import os
import signal
import ssl
import subprocess
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path

import certifi

from step2_detector import build_shot_manifest


BASE_DIR = Path(__file__).resolve().parent
CONFIG_PATH = BASE_DIR / "config.json"
LOCK_PATH = BASE_DIR / "render.lock"
STATE_DIR = BASE_DIR / "state"
JOBS_DIR = STATE_DIR / "jobs"
LOG_PATH = STATE_DIR / "agent.log"

RUNNING = True


def log(msg):
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    line = f"[{datetime.now().isoformat(timespec='seconds')}] {msg}"
    print(line, flush=True)
    with LOG_PATH.open("a", encoding="utf-8") as f:
        f.write(line + "\n")


def load_config():
    if not CONFIG_PATH.exists():
        raise FileNotFoundError(
            "Missing config.json. Copy config.example.json to config.json and edit it."
        )

    cfg = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))

    for key in [
        "server_url",
        "mac_agent_token",
        "source_root",
        "output_root",
        "render_script",
    ]:
        if not cfg.get(key):
            raise ValueError(f"Missing config value: {key}")

    cfg.setdefault("poll_seconds", 5)
    cfg.setdefault("device_id", "qn-macbook-01")
    cfg.setdefault("python_bin", sys.executable)

    return cfg


def http_json(method, url, token, body=None):
    data = None

    headers = {
        "x-control-key": token,
        "Accept": "application/json",
        "User-Agent": "QN-Mac-Agent/1.0",
    }

    if body is not None:
        data = json.dumps(body).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(
        url,
        data=data,
        headers=headers,
        method=method,
    )

    try:
        with urllib.request.urlopen(
            req,
            timeout=30,
            context=ssl.create_default_context(cafile=certifi.where()),
        ) as response:
            raw = response.read().decode("utf-8")
            return json.loads(raw) if raw else {}

    except urllib.error.HTTPError as exc:
        raise RuntimeError(
            f"HTTP {exc.code}: {exc.read().decode(errors='replace')}"
        ) from exc


def claim_next_job(cfg):
    url = cfg["server_url"].rstrip("/") + "/api/jobs/next"
    return http_json("GET", url, cfg["mac_agent_token"]).get("job")


def update_job(
    cfg,
    job_id,
    status,
    progress=None,
    error=None,
    output_drive_url=None,
    shot_manifest=None,
):
    body = {"status": status}

    if progress is not None:
        body["progress"] = int(progress)

    if error:
        body["error"] = str(error)

    if output_drive_url:
        body["outputDriveUrl"] = output_drive_url

    if shot_manifest is not None:
        body["shot_manifest"] = shot_manifest

    url = cfg["server_url"].rstrip("/") + f"/api/jobs/{job_id}/status"

    return http_json(
        "POST",
        url,
        cfg["mac_agent_token"],
        body,
    )


def acquire_lock(job_id):
    try:
        fd = os.open(
            str(LOCK_PATH),
            os.O_CREAT | os.O_EXCL | os.O_WRONLY,
        )

        with os.fdopen(fd, "w") as f:
            f.write(job_id)

        return True

    except FileExistsError:
        return False


def release_lock():
    try:
        LOCK_PATH.unlink(missing_ok=True)
    except Exception as exc:
        log(f"Warning removing lock: {exc}")


def normalize(entry):
    if isinstance(entry, str):
        return {
            "source_id": None,
            "id": None,
            "name": entry,
        }

    if isinstance(entry, dict):
        return {
            "source_id": entry.get("source_id"),
            "id": entry.get("id"),
            "name": entry.get("name") or entry.get("filename"),
            "mimeType": entry.get("mimeType"),
        }

    raise ValueError(f"Unsupported file entry: {entry!r}")


def resolve_sources(cfg, job):
    root = Path(cfg["source_root"]).expanduser().resolve()

    if not root.exists():
        raise FileNotFoundError(f"Source root not found: {root}")

    index = {}

    for path in root.rglob("*"):
        if path.is_file():
            index.setdefault(path.name.lower(), []).append(path)

    raw_sources = (
        job.get("sources")
        or job.get("source_manifest", {}).get("clips")
        or job.get("source_manifest", {}).get("sources")
        or []
    )

    resolved = []

    for raw in raw_sources:
        source = normalize(raw)

        name = source.get("name")
        if not name:
            raise ValueError("Selected file has no filename")

        matches = index.get(name.lower(), [])

        if not matches:
            raise FileNotFoundError(
                f"File not found in mirrored Drive: {name}"
            )

        if len(matches) > 1:
            raise RuntimeError(
                f"Duplicate filename found: {name}. Refusing to guess."
            )

        resolved.append({
            **source,
            "local_path": str(matches[0]),
        })

    return resolved


def save_job(job, sources, cfg):
    JOBS_DIR.mkdir(parents=True, exist_ok=True)

    out_root = Path(cfg["output_root"]).expanduser().resolve()
    out_root.mkdir(parents=True, exist_ok=True)

    payload = dict(job)
    payload["resolved_files"] = sources
    payload["output_root"] = str(out_root)
    payload["device_id"] = cfg["device_id"]

    path = JOBS_DIR / f"{job['job_id']}.json"
    path.write_text(
        json.dumps(payload, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    return path


def run_render(cfg, job_path):
    script = Path(cfg["render_script"]).expanduser().resolve()

    if not script.exists():
        raise FileNotFoundError(f"Render script not found: {script}")

    cmd = [
        cfg["python_bin"],
        str(script),
        "--job",
        str(job_path),
    ]

    log("Running: " + " ".join(cmd))

    proc = subprocess.run(
        cmd,
        cwd=str(script.parent),
        text=True,
        capture_output=True,
    )

    if proc.stdout:
        log("RENDER STDOUT:\n" + proc.stdout[-6000:])

    if proc.stderr:
        log("RENDER STDERR:\n" + proc.stderr[-6000:])

    if proc.returncode != 0:
        raise RuntimeError(
            f"Render exited with code {proc.returncode}"
        )

    lines = [
        line.strip()
        for line in proc.stdout.splitlines()
        if line.strip()
    ]

    if not lines:
        raise RuntimeError("Render script returned no result")

    result = json.loads(lines[-1])

    output_path = Path(
        result["output_path"]
    ).expanduser().resolve()

    if not output_path.exists():
        raise FileNotFoundError(
            f"Output not found: {output_path}"
        )

    return {
        "output_path": str(output_path),
        "output_drive_url": result.get("output_drive_url"),
    }


def process_job(cfg, job):
    jid = job["job_id"]

    if not acquire_lock(jid):
        log("render.lock exists; skipping")
        return

    try:
        log(
            f"Processing {jid}: "
            f"{job.get('name', 'Untitled')}"
        )

        update_job(
            cfg,
            jid,
            "downloading",
            10,
        )

        sources = resolve_sources(cfg, job)
        log(
            f"Resolved {len(sources)} source file(s)"
        )

        save_job(job, sources, cfg)

        log(
            f"READY: {len(sources)} "
            "source file(s) verified"
        )

        log(
            "STEP 2: running real shot detection"
        )

        shot_manifest = build_shot_manifest(
            sources
        )

        log(
            "STEP 2 COMPLETE: "
            f"{len(shot_manifest['shots'])} "
            "shot(s) detected"
        )

        update_job(
            cfg,
            jid,
            "ready",
            100,
            shot_manifest=shot_manifest,
        )

        return

    except Exception as exc:
        log(f"FAILED: {exc}")

        try:
            update_job(
                cfg,
                jid,
                "failed",
                0,
                error=str(exc),
            )
        except Exception as update_exc:
            log(
                "Could not report failure: "
                f"{update_exc}"
            )

    finally:
        release_lock()


def handle_signal(signum, frame):
    global RUNNING

    RUNNING = False
    log(f"Signal {signum}; stopping")


def main():
    signal.signal(
        signal.SIGINT,
        handle_signal,
    )
    signal.signal(
        signal.SIGTERM,
        handle_signal,
    )

    cfg = load_config()

    log(
        f"QN Mac Agent starting as "
        f"{cfg['device_id']}"
    )
    log(f"Server: {cfg['server_url']}")
    log(
        f"Poll every {cfg['poll_seconds']}s "
        "| concurrency=1"
    )

    while RUNNING:
        if LOCK_PATH.exists():
            time.sleep(
                cfg["poll_seconds"]
            )
            continue

        try:
            job = claim_next_job(cfg)

            if job:
                process_job(cfg, job)
            else:
                time.sleep(
                    cfg["poll_seconds"]
                )

        except Exception as exc:
            log(f"Poll error: {exc}")
            time.sleep(
                max(
                    cfg["poll_seconds"],
                    5,
                )
            )

    log("Agent stopped")


if __name__ == "__main__":
    main()
