#!/usr/bin/env python3

import base64
import json
import subprocess
import urllib.error
import urllib.request


FRAME_POSITIONS = (0.15, 0.5, 0.85)
FRAME_WIDTH = 512


class VisionBackendError(RuntimeError):
    pass


def _extract_frame(path, timestamp):
    result = subprocess.run(
        [
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-ss", f"{timestamp:.3f}",
            "-i", str(path), "-frames:v", "1", "-vf", f"scale={FRAME_WIDTH}:-2",
            "-f", "image2pipe", "-vcodec", "mjpeg", "-",
        ],
        capture_output=True,
    )
    if result.returncode != 0 or not result.stdout:
        detail = result.stderr.decode(errors="replace").strip()[-1000:]
        raise VisionBackendError(f"Could not extract visual-tag frame from {path}: {detail}")
    return base64.b64encode(result.stdout).decode("ascii")


def _parse_response(raw, shot_id):
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise VisionBackendError(f"Vision backend returned invalid JSON for shot {shot_id}") from exc
    if not isinstance(payload, dict):
        raise VisionBackendError(f"Vision backend returned a non-object for shot {shot_id}")
    tags = payload.get("visual_tags")
    if not isinstance(tags, list) or not tags or not all(isinstance(tag, str) and tag.strip() for tag in tags):
        raise VisionBackendError(f"Vision backend returned invalid visual_tags for shot {shot_id}")
    for field in ("primary_subject", "setting", "action"):
        if not isinstance(payload.get(field), str) or not payload[field].strip():
            raise VisionBackendError(f"Vision backend returned invalid {field} for shot {shot_id}")
    return {
        "visual_tags": tags,
        "primary_subject": payload["primary_subject"].strip(),
        "setting": payload["setting"].strip(),
        "action": payload["action"].strip(),
    }


def analyze_shot(source_path, shot, backend_url, model):
    start_sec = float(shot["start_sec"])
    end_sec = float(shot["end_sec"])
    if end_sec <= start_sec:
        raise ValueError(f"Invalid boundaries for shot {shot.get('shot_id')}")
    duration = end_sec - start_sec
    images = [_extract_frame(source_path, start_sec + duration * position) for position in FRAME_POSITIONS]
    prompt = (
        "Analyze these representative frames from one video shot. "
        "Return JSON only with exactly these fields: visual_tags (array of concise strings), "
        "primary_subject (string), setting (string), action (string). "
        "Describe only visible content. Do not guess names, locations, or events."
    )
    body = json.dumps({
        "model": model,
        "prompt": prompt,
        "images": images,
        "stream": False,
        "format": "json",
    }).encode("utf-8")
    request = urllib.request.Request(
        backend_url,
        data=body,
        headers={"Content-Type": "application/json", "Accept": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            response_body = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise VisionBackendError(
            f"Local vision backend unavailable for shot {shot.get('shot_id')}: {exc}"
        ) from exc
    if not isinstance(response_body, dict) or not isinstance(response_body.get("response"), str):
        raise VisionBackendError(f"Local vision backend returned no response for shot {shot.get('shot_id')}")
    try:
        parsed = json.loads(response_body["response"])
    except json.JSONDecodeError as exc:
        raise VisionBackendError(f"Local vision backend returned invalid analysis for shot {shot.get('shot_id')}") from exc
    return _parse_response(json.dumps(parsed), shot["shot_id"])


def build_visual_tag_manifest(shot_manifest, sources, backend_url, model):
    if not isinstance(shot_manifest, dict) or not isinstance(shot_manifest.get("shots"), list):
        raise TypeError("Step 2 shot_manifest must contain a shots array.")
    source_paths = {
        source.get("source_id"): source.get("local_path")
        for source in sources
        if source.get("source_id") and source.get("local_path")
    }
    results = []
    for shot in shot_manifest["shots"]:
        source_path = source_paths.get(shot.get("source_id"))
        if not source_path:
            raise ValueError(f"No resolved source for shot {shot.get('shot_id')}")
        analysis = analyze_shot(source_path, shot, backend_url, model)
        results.append({
            "shot_id": shot["shot_id"],
            "source_id": shot["source_id"],
            **analysis,
        })
    return {
        "status": "completed",
        "input_step": "02_shot_detection",
        "input_job_id": shot_manifest.get("input_job_id"),
        "shots": results,
    }