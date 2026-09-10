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


def _strip_code_fence(raw):
    text = raw.strip()
    lines = text.splitlines()
    if len(lines) < 3 or lines[0].strip().lower() not in ("```", "```json") or lines[-1].strip() != "```":
        return text
    return "\n".join(lines[1:-1]).strip()


def _request_json(backend_url, body, shot_id, backend_name):
    request = urllib.request.Request(
        backend_url,
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json", "Accept": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            response_body = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode(errors="replace").strip()[-1000:]
        raise VisionBackendError(
            f"{backend_name} vision request failed for shot {shot_id} "
            f"with HTTP {exc.code}: {detail or 'no error detail'}"
        ) from exc
    except urllib.error.URLError as exc:
        raise VisionBackendError(
            f"{backend_name} vision server unavailable at {backend_url} "
            f"for shot {shot_id}: {exc.reason}"
        ) from exc
    except (TimeoutError, json.JSONDecodeError) as exc:
        raise VisionBackendError(
            f"{backend_name} vision server returned invalid JSON for shot {shot_id}: {exc}"
        ) from exc
    if not isinstance(response_body, dict):
        raise VisionBackendError(
            f"{backend_name} vision server returned a non-object for shot {shot_id}"
        )
    if isinstance(response_body.get("error"), dict):
        detail = response_body["error"].get("message") or str(response_body["error"])
        raise VisionBackendError(
            f"{backend_name} vision request failed for shot {shot_id}: {detail}"
        )
    return response_body


def _llama_cpp_response(backend_url, model, prompt, images, shot_id):
    content = [{"type": "text", "text": prompt}]
    content.extend(
        {
            "type": "image_url",
            "image_url": {"url": f"data:image/jpeg;base64,{image}"},
        }
        for image in images
    )
    response_body = _request_json(
        backend_url,
        {
            "model": model,
            "messages": [{"role": "user", "content": content}],
            "stream": False,
            "temperature": 0,
            "max_tokens": 220,
        },
        shot_id,
        "llama.cpp",
    )
    choices = response_body.get("choices")
    if not isinstance(choices, list) or not choices:
        raise VisionBackendError(
            f"llama.cpp model '{model}' returned no vision choices for shot {shot_id}; "
            "verify the server model supports multimodal image input"
        )
    message = choices[0].get("message") if isinstance(choices[0], dict) else None
    response = message.get("content") if isinstance(message, dict) else None
    if isinstance(response, list):
        response = "".join(
            part.get("text", "") for part in response if isinstance(part, dict)
        )
    if not isinstance(response, str) or not response.strip():
        raise VisionBackendError(
            f"llama.cpp model '{model}' returned no vision content for shot {shot_id}; "
            "verify the loaded model has vision capability"
        )
    return response


def _ollama_response(backend_url, model, prompt, images, shot_id):
    response_body = _request_json(
        backend_url,
        {
            "model": model,
            "prompt": prompt,
            "images": images,
            "stream": False,
            "format": "json",
        },
        shot_id,
        "Ollama",
    )
    response = response_body.get("response")
    if not isinstance(response, str) or not response.strip():
        raise VisionBackendError(
            f"Ollama model '{model}' returned no vision response for shot {shot_id}; "
            "verify the model supports image input"
        )
    return response


def analyze_shot(source_path, shot, backend_url, model, backend="llama_cpp"):
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
    if backend == "llama_cpp":
        llama_prompt = (
            "Return JSON only with exactly four fields: visual_tags (array of concise strings), "
            "primary_subject, setting, and action. Describe only visible content."
        )
        raw_response = _llama_cpp_response(
            backend_url, model, llama_prompt, images, shot["shot_id"]
        )
    elif backend == "ollama":
        raw_response = _ollama_response(backend_url, model, prompt, images, shot["shot_id"])
    else:
        raise VisionBackendError(
            f"Unsupported vision backend '{backend}'; use 'llama_cpp' or 'ollama'"
        )
    normalized_response = _strip_code_fence(raw_response)
    try:
        parsed = json.loads(normalized_response)
    except json.JSONDecodeError as exc:
        if backend == "llama_cpp":
            raw_preview = repr(raw_response[:1000])
            raise VisionBackendError(
                f"llama.cpp vision backend returned invalid analysis for shot "
                f"{shot.get('shot_id')}; raw response (truncated): {raw_preview}"
            ) from exc
        raise VisionBackendError(
            f"Local vision backend returned invalid analysis for shot {shot.get('shot_id')}"
        ) from exc
    return _parse_response(json.dumps(parsed), shot["shot_id"])


def build_visual_tag_manifest(shot_manifest, sources, backend_url, model, backend="llama_cpp"):
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
        analysis = analyze_shot(source_path, shot, backend_url, model, backend)
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