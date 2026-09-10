#!/usr/bin/env python3

import math
import subprocess


FRAME_WIDTH = 320
FRAME_HEIGHT = 180
MAX_FRAMES = 16


def _score(value):
    return round(max(0.0, min(100.0, value)), 2)


def _read_gray_frames(path, start_sec, end_sec):
    duration = end_sec - start_sec
    fps = min(2.0, MAX_FRAMES / duration)
    result = subprocess.run(
        [
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-ss", f"{start_sec:.3f}",
            "-i", str(path), "-t", f"{duration:.3f}", "-vf",
            f"fps={fps:.6f},scale={FRAME_WIDTH}:{FRAME_HEIGHT},format=gray",
            "-f", "rawvideo", "-pix_fmt", "gray", "-",
        ],
        capture_output=True,
    )
    if result.returncode != 0:
        raise RuntimeError(
            f"ffmpeg quality analysis failed for {path}: "
            f"{result.stderr.decode(errors='replace').strip()[-2000:]}"
        )
    frame_size = FRAME_WIDTH * FRAME_HEIGHT
    raw = result.stdout
    return [raw[offset:offset + frame_size] for offset in range(0, len(raw) - frame_size + 1, frame_size)]


def _frame_metrics(frame):
    pixel_count = len(frame)
    mean = sum(frame) / pixel_count
    clipped = sum(value < 8 or value > 247 for value in frame) / pixel_count
    laplacian = []
    for row in range(1, FRAME_HEIGHT - 1):
        offset = row * FRAME_WIDTH
        for column in range(1, FRAME_WIDTH - 1):
            center = frame[offset + column]
            laplacian.append(
                4 * center
                - frame[offset + column - 1]
                - frame[offset + column + 1]
                - frame[offset - FRAME_WIDTH + column]
                - frame[offset + FRAME_WIDTH + column]
            )
    lap_mean = sum(laplacian) / len(laplacian)
    sharpness = sum((value - lap_mean) ** 2 for value in laplacian) / len(laplacian)
    return mean, clipped, sharpness


def analyze_shot(source_path, shot):
    start_sec = float(shot["start_sec"])
    end_sec = float(shot["end_sec"])
    if not math.isfinite(start_sec) or not math.isfinite(end_sec) or end_sec <= start_sec:
        raise ValueError(f"Invalid boundaries for shot {shot.get('shot_id')}")
    frames = _read_gray_frames(source_path, start_sec, end_sec)
    if not frames:
        raise RuntimeError(f"No frames available for shot {shot.get('shot_id')}")

    metrics = [_frame_metrics(frame) for frame in frames]
    mean_brightness = sum(item[0] for item in metrics) / len(metrics)
    clipped_ratio = sum(item[1] for item in metrics) / len(metrics)
    sharpness_value = sum(item[2] for item in metrics) / len(metrics)
    differences = [
        sum(abs(left - right) for left, right in zip(previous, current)) / len(current)
        for previous, current in zip(frames, frames[1:])
    ]
    motion = sum(differences) / len(differences) if differences else 0.0

    sharpness_score = _score(100.0 * (1.0 - math.exp(-sharpness_value / 500.0)))
    stability_score = _score(100.0 * (1.0 - min(motion / 35.0, 1.0)))
    exposure_score = _score(100.0 - abs(mean_brightness - 128.0) * 0.55 - max(0.0, clipped_ratio - 0.02) * 180.0)
    overall_quality_score = _score(0.35 * sharpness_score + 0.30 * stability_score + 0.35 * exposure_score)

    quality_flags = []
    if sharpness_score < 35:
        quality_flags.append("soft")
    if stability_score < 35:
        quality_flags.append("unstable")
    if exposure_score < 35:
        quality_flags.append("poor_exposure")
    if mean_brightness < 35:
        quality_flags.append("underexposed")
    elif mean_brightness > 220:
        quality_flags.append("overexposed")

    return {
        "shot_id": shot["shot_id"],
        "source_id": shot["source_id"],
        "sharpness_score": sharpness_score,
        "stability_score": stability_score,
        "exposure_score": exposure_score,
        "overall_quality_score": overall_quality_score,
        "quality_flags": quality_flags,
    }


def build_quality_manifest(shot_manifest, sources):
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
        results.append(analyze_shot(source_path, shot))
    return {
        "status": "completed",
        "input_step": "02_shot_detection",
        "input_job_id": shot_manifest.get("input_job_id"),
        "shots": results,
    }