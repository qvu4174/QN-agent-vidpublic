#!/usr/bin/env python3

import json
import os
import signal
import ssl
import subprocess
import sys
import threading
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path

import certifi

from step2_detector import build_shot_manifest
from quality_analyzer import build_quality_manifest
from visual_tag_analyzer import build_visual_tag_manifest
from duplicate_analyzer import build_duplicate_manifest


BASE_DIR = Path(__file__).resolve().parent
CONFIG_PATH = BASE_DIR / "config.json"
LOCK_PATH = BASE_DIR / "render.lock"
STATE_DIR = BASE_DIR / "state"
JOBS_DIR = STATE_DIR / "jobs"
LOG_PATH = STATE_DIR / "agent.log"

RUNNING = True
STOP_EVENT = threading.Event()


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

    # Adaptive queue polling:
    # - active: check quickly after recent job activity
    # - idle: back off to reduce unnecessary Worker/KV reads
    cfg.setdefault("active_poll_seconds", 15)
    cfg.setdefault("idle_poll_seconds", 300)
    cfg["active_poll_seconds"] = max(1, int(cfg["active_poll_seconds"]))
    cfg["idle_poll_seconds"] = max(
        cfg["active_poll_seconds"],
        int(cfg["idle_poll_seconds"]),
    )
    cfg.setdefault("device_id", "qn-macbook-01")
    cfg.setdefault("python_bin", sys.executable)
    cfg.setdefault("vision_backend", "llama_cpp")
    cfg.setdefault("vision_backend_url", "http://127.0.0.1:8080/v1/chat/completions")
    cfg.setdefault("vision_model", "local-vision-model")

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
    quality_manifest=None,
    visual_tag_manifest=None,
    duplicate_manifest=None,
    story_manifest=None,
    ranking_manifest=None,
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
    if quality_manifest is not None:
        body["quality_manifest"] = quality_manifest
    if visual_tag_manifest is not None:
        body["visual_tag_manifest"] = visual_tag_manifest
    if duplicate_manifest is not None:
        body["duplicate_manifest"] = duplicate_manifest
    if story_manifest is not None:
        body["story_manifest"] = story_manifest
    if ranking_manifest is not None:
        body["ranking_manifest"] = ranking_manifest

    url = cfg["server_url"].rstrip("/") + f"/api/jobs/{job_id}/status"

    return http_json(
        "POST",
        url,
        cfg["mac_agent_token"],
        body,
    )


def request_story(cfg, job_id, manifests):
    url = cfg["server_url"].rstrip("/") + f"/api/jobs/{job_id}/story"
    response = http_json("POST", url, cfg["mac_agent_token"], manifests)
    story_manifest = response.get("story_manifest")
    if not isinstance(story_manifest, dict):
        raise RuntimeError("Story endpoint returned no story manifest")
    return story_manifest


def request_ranking(cfg, job_id, manifests):
    url = cfg["server_url"].rstrip("/") + f"/api/jobs/{job_id}/ranking"
    response = http_json("POST", url, cfg["mac_agent_token"], manifests)
    ranking_manifest = response.get("ranking_manifest")
    if not isinstance(ranking_manifest, dict):
        raise RuntimeError("Ranking endpoint returned no ranking manifest")
    return ranking_manifest


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
            "quality_analyzing",
            60,
            shot_manifest=shot_manifest,
        )

        log("STEP 3: running deterministic quality analysis")
        quality_manifest = build_quality_manifest(shot_manifest, sources)
        log(
            "STEP 3 COMPLETE: "
            f"{len(quality_manifest['shots'])} quality result(s)"
        )

        update_job(
            cfg,
            jid,
            "visual_tag_analyzing",
            80,
            quality_manifest=quality_manifest,
        )

        log("STEP 4: running local vision tagging")
        visual_tag_manifest = build_visual_tag_manifest(
            shot_manifest,
            sources,
            cfg["vision_backend_url"],
            cfg["vision_model"],
            cfg["vision_backend"],
        )
        log(
            "STEP 4 COMPLETE: "
            f"{len(visual_tag_manifest['shots'])} visual tag result(s)"
        )

        update_job(
            cfg,
            jid,
            "duplicate_analyzing",
            90,
            visual_tag_manifest=visual_tag_manifest,
        )

        log("STEP 5: running deterministic duplicate analysis")
        duplicate_manifest = build_duplicate_manifest(shot_manifest, sources)
        log(
            "STEP 5 COMPLETE: "
            f"{len(duplicate_manifest['shots'])} duplicate result(s)"
        )

        update_job(
            cfg,
            jid,
            "story_analyzing",
            95,
            duplicate_manifest=duplicate_manifest,
        )

        log("STEP 6: running Gemini story analysis")
        story_manifest = request_story(
            cfg,
            jid,
            {
                "shot_manifest": shot_manifest,
                "quality_manifest": quality_manifest,
                "visual_tag_manifest": visual_tag_manifest,
                "duplicate_manifest": duplicate_manifest,
            },
        )
        log("STEP 6 COMPLETE: story manifest generated")

        update_job(
            cfg,
            jid,
            "ranking_analyzing",
            98,
            story_manifest=story_manifest,
        )

        log("STEP 7: running Gemini shot ranking")
        ranking_manifest = request_ranking(
            cfg,
            jid,
            {
                "shot_manifest": shot_manifest,
                "quality_manifest": quality_manifest,
                "visual_tag_manifest": visual_tag_manifest,
                "duplicate_manifest": duplicate_manifest,
                "story_manifest": story_manifest,
            },
        )
        log(
            "STEP 7 COMPLETE: "
            f"{len(ranking_manifest['shots'])} ranking result(s)"
        )

        update_job(
            cfg,
            jid,
            "ready",
            100,
            ranking_manifest=ranking_manifest,
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
    STOP_EVENT.set()
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
    active_poll = cfg["active_poll_seconds"]
    idle_poll = cfg["idle_poll_seconds"]

    # After processing a job, stay responsive for a while, then progressively
    # back off to the normal idle interval.
    backoff_delays = [
        active_poll,
        min(30, idle_poll),
        min(60, idle_poll),
        min(120, idle_poll),
        idle_poll,
    ]
    backoff_delays = list(dict.fromkeys(backoff_delays))
    backoff_index = len(backoff_delays) - 1

    log(
        f"Adaptive polling: active={active_poll}s "
        f"| idle={idle_poll}s | concurrency=1"
    )

    while RUNNING:
        if LOCK_PATH.exists():
            # Local wait only; this does not consume Worker/KV reads.
            STOP_EVENT.wait(active_poll)
            continue

        try:
            job = claim_next_job(cfg)

            if job:
                process_job(cfg, job)
                # A job just ran. Poll quickly for another queued job.
                backoff_index = 0
                continue

            delay = backoff_delays[backoff_index]
            STOP_EVENT.wait(delay)

            if backoff_index < len(backoff_delays) - 1:
                backoff_index += 1

        except Exception as exc:
            log(f"Poll error: {exc}")
            # Avoid hammering the Worker during network/server failures.
            STOP_EVENT.wait(min(idle_poll, max(active_poll, 60)))

    log("Agent stopped")


if __name__ == "__main__":
    main()
