#!/usr/bin/env python3

import subprocess


FRAME_POSITIONS = (0.15, 0.5, 0.85)
FRAME_WIDTH = 32
FRAME_HEIGHT = 18
NEAR_DUPLICATE_THRESHOLD = 0.92


def _extract_frame(path, timestamp):
    result = subprocess.run(
        [
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-ss", f"{timestamp:.3f}",
            "-i", str(path), "-frames:v", "1", "-vf",
            f"scale={FRAME_WIDTH}:{FRAME_HEIGHT},format=gray",
            "-f", "rawvideo", "-pix_fmt", "gray", "-",
        ],
        capture_output=True,
    )
    frame_size = FRAME_WIDTH * FRAME_HEIGHT
    if result.returncode != 0 or len(result.stdout) < frame_size:
        detail = result.stderr.decode(errors="replace").strip()[-1000:]
        raise RuntimeError(f"Duplicate frame extraction failed for {path}: {detail}")
    return result.stdout[:frame_size]


def _fingerprint(path, shot):
    start_sec = float(shot["start_sec"])
    end_sec = float(shot["end_sec"])
    if end_sec <= start_sec:
        raise ValueError(f"Invalid boundaries for shot {shot.get('shot_id')}")
    duration = end_sec - start_sec
    return tuple(
        _extract_frame(path, start_sec + duration * position)
        for position in FRAME_POSITIONS
    )


def _similarity(left, right):
    differences = [
        sum(abs(a - b) for a, b in zip(left_frame, right_frame))
        / len(left_frame)
        / 255.0
        for left_frame, right_frame in zip(left, right)
    ]
    return round(1.0 - sum(differences) / len(differences), 4)


def build_duplicate_manifest(shot_manifest, sources):
    if not isinstance(shot_manifest, dict) or not isinstance(shot_manifest.get("shots"), list):
        raise TypeError("Step 2 shot_manifest must contain a shots array.")
    source_paths = {
        source.get("source_id"): source.get("local_path")
        for source in sources
        if source.get("source_id") and source.get("local_path")
    }
    shots = shot_manifest["shots"]
    fingerprints = []
    for shot in shots:
        source_path = source_paths.get(shot.get("source_id"))
        if not source_path:
            raise ValueError(f"No resolved source for shot {shot.get('shot_id')}")
        fingerprints.append(_fingerprint(source_path, shot))

    groups = []
    assignments = []
    best_scores = [None] * len(shots)
    for index, fingerprint in enumerate(fingerprints):
        matching_group = None
        for previous_index in range(index):
            score = _similarity(fingerprint, fingerprints[previous_index])
            if best_scores[index] is None or score > best_scores[index]:
                best_scores[index] = score
            if score >= NEAR_DUPLICATE_THRESHOLD and matching_group is None:
                matching_group = assignments[previous_index]
        if matching_group is None:
            matching_group = len(groups)
            groups.append(index)
        assignments.append(matching_group)

    results = []
    for index, shot in enumerate(shots):
        group_members = [member for member, group in enumerate(assignments) if group == assignments[index]]
        is_duplicate = len(group_members) > 1
        canonical_index = group_members[0]
        results.append({
            "shot_id": shot["shot_id"],
            "source_id": shot["source_id"],
            "duplicate_group_id": f"duplicate_{assignments[index] + 1:03d}" if is_duplicate else None,
            "duplicate_of_shot_id": shots[canonical_index]["shot_id"] if is_duplicate and canonical_index != index else None,
            "similarity_score": best_scores[index],
            "duplicate_status": "duplicate" if is_duplicate and canonical_index != index else "unique",
        })
    return {
        "status": "completed",
        "input_step": "02_shot_detection",
        "input_job_id": shot_manifest.get("input_job_id"),
        "shots": results,
    }