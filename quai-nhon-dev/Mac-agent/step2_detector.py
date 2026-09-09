#!/usr/bin/env python3

import re
import subprocess


SCENE_THRESHOLD = 0.3


def probe_duration(path):
    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(path),
        ],
        text=True,
        capture_output=True,
    )

    if result.returncode != 0:
        raise RuntimeError(
            f"ffprobe failed for {path}: {result.stderr.strip()}"
        )

    raw_duration = result.stdout.strip()

    if not raw_duration:
        raise RuntimeError(
            f"ffprobe returned no duration for {path}"
        )

    duration = float(raw_duration)

    if duration <= 0:
        raise RuntimeError(
            f"Invalid duration for {path}: {duration}"
        )

    return duration


def detect_scene_times(path):
    result = subprocess.run(
        [
            "ffmpeg",
            "-hide_banner",
            "-i",
            str(path),
            "-vf",
            f"select='gt(scene,{SCENE_THRESHOLD})',showinfo",
            "-an",
            "-f",
            "null",
            "-",
        ],
        text=True,
        capture_output=True,
    )

    if result.returncode != 0:
        raise RuntimeError(
            f"ffmpeg scene detection failed for {path}: "
            f"{result.stderr.strip()[-2000:]}"
        )

    times = []

    for match in re.finditer(
        r"pts_time:([0-9]+(?:\.[0-9]+)?)",
        result.stderr,
    ):
        times.append(float(match.group(1)))

    return times


def detect_source(source):
    source_id = source.get("source_id")

    if not source_id:
        raise ValueError("Source missing source_id")

    path = source.get("local_path")

    if not path:
        raise ValueError(
            f"Source {source_id} missing local_path"
        )

    duration = probe_duration(path)
    cuts = detect_scene_times(path)

    boundaries = [0.0]

    for cut in sorted(set(cuts)):
        if 0 < cut < duration:
            boundaries.append(cut)

    boundaries.append(duration)

    shots = []

    for index in range(len(boundaries) - 1):
        start = boundaries[index]
        end = boundaries[index + 1]

        shots.append(
            {
                "shot_id": (
                    f"{source_id}_shot_{index + 1:03d}"
                ),
                "source_id": source_id,
                "start_sec": round(start, 3),
                "end_sec": round(end, 3),
                "duration_sec": round(end - start, 3),
            }
        )

    return shots


def build_shot_manifest(sources):
    shots = []

    for source in sources:
        shots.extend(
            detect_source(source)
        )

    return {
        "shots": shots,
    }
