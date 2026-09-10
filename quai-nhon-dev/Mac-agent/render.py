#!/usr/bin/env python3

import argparse
import json
import logging
import math
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


TARGET_WIDTH = 1080
TARGET_HEIGHT = 1920
FRAME_RATE = 30
DURATION_TOLERANCE_SEC = 0.15


def fail(message):
    raise RuntimeError(message)


def run_command(command):
    try:
        return subprocess.run(command, check=True, text=True, capture_output=True)
    except FileNotFoundError as exc:
        fail(f"Required command not found: {command[0]}")
    except subprocess.CalledProcessError as exc:
        detail = (exc.stderr or exc.stdout or "").strip()[-4000:]
        fail(f"FFmpeg command failed (exit {exc.returncode}): {detail}")


def read_job(path):
    try:
        job = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        fail(f"Could not read job JSON: {exc}")
    if not isinstance(job, dict):
        fail("Job JSON must be an object.")
    plan = job.get("reel_plan")
    if not isinstance(plan, dict):
        fail("Job is missing reel_plan.")
    return job, plan


def validate_plan(job, plan):
    timing = plan.get("timing")
    if not isinstance(timing, dict):
        fail("reel_plan is missing timing data.")
    shot_timings = timing.get("shot_timings")
    transitions = timing.get("transitions")
    target_duration = timing.get("target_reel_duration_sec")
    if not isinstance(shot_timings, list) or not shot_timings:
        fail("reel_plan timing must contain ordered shot_timings.")
    if not isinstance(transitions, list) or len(transitions) != len(shot_timings) - 1:
        fail("reel_plan timing must contain one transition per adjacent shot pair.")
    if not isinstance(target_duration, (int, float)) or target_duration <= 0:
        fail("reel_plan timing has an invalid target duration.")
    sources = plan.get("sources")
    if not isinstance(sources, list):
        fail("reel_plan is missing sources.")
    source_by_id = {source.get("source_id"): source for source in sources if isinstance(source, dict)}
    selected = []
    for index, timing_item in enumerate(shot_timings):
        if not isinstance(timing_item, dict):
            fail(f"Shot timing {index} is invalid.")
        shot_id = timing_item.get("shot_id")
        source_id = timing_item.get("source_id")
        source_in = timing_item.get("source_in_sec")
        duration = timing_item.get("use_duration_sec")
        if not isinstance(shot_id, str) or not shot_id or not isinstance(source_id, str) or not source_id:
            fail(f"Shot timing {index} is missing shot/source identity.")
        if not isinstance(source_in, (int, float)) or not isinstance(duration, (int, float)) or source_in < 0 or duration <= 0:
            fail(f"Shot timing {shot_id} has an invalid source range.")
        source = source_by_id.get(source_id)
        if not source:
            fail(f"Selected source {source_id} is missing from reel_plan sources.")
        local_path = source.get("local_path")
        if not isinstance(local_path, str) or not local_path:
            fail(f"Selected source {source_id} has no local_path.")
        local_file = Path(local_path).expanduser()
        if not local_file.is_file():
            fail(f"Selected source {source_id} local_path does not exist: {local_file}")
        source_duration = source.get("duration_sec")
        if isinstance(source_duration, (int, float)) and source_in + duration > source_duration + 0.001:
            fail(f"Shot timing {shot_id} exceeds source {source_id} duration.")
        selected.append((timing_item, local_file))
    for index, transition in enumerate(transitions):
        if not isinstance(transition, dict):
            fail(f"Transition {index} is invalid.")
        transition_type = transition.get("transition_type")
        duration = transition.get("transition_duration_sec", 0)
        if transition_type not in {"cut", "crossfade"}:
            fail(f"Transition {index} has unsupported type: {transition_type}")
        if transition.get("from_shot_id") != shot_timings[index].get("shot_id") or transition.get("to_shot_id") != shot_timings[index + 1].get("shot_id"):
            fail(f"Transition {index} does not connect adjacent timed shots.")
        if not isinstance(duration, (int, float)) or duration < 0 or (transition_type == "crossfade" and duration <= 0):
            fail(f"Transition {index} has an invalid duration.")
        if transition_type == "cut" and duration != 0:
            fail(f"Cut transition {index} must have zero duration.")
    return selected, transitions, float(target_duration)


def escape_filter_path(path):
    return str(path).replace("\\", "\\\\").replace(":", "\\:").replace("'", "\\'")


def escape_drawtext_path(path):
    return escape_filter_path(path).replace("[", "\\[").replace("]", "\\]")


def placement(placement_hint):
    hint = str(placement_hint or "").lower()
    if "top" in hint:
        return "x=(w-text_w)/2:y=h*0.12"
    if "center" in hint or "middle" in hint:
        return "x=(w-text_w)/2:y=(h-text_h)/2"
    return "x=(w-text_w)/2:y=h*0.78"


def has_drawtext_support():
    try:
        result = subprocess.run(["ffmpeg", "-hide_banner", "-filters"], check=False, text=True, capture_output=True)
    except OSError:
        return False
    return result.returncode == 0 and any("drawtext" in line.split() for line in result.stdout.splitlines())


def create_clip(source_path, timing_item, output_path):
    source_in = float(timing_item["source_in_sec"])
    duration = float(timing_item["use_duration_sec"])
    video_filter = "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,format=yuv420p"
    command = [
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-ss", f"{source_in:.6f}", "-i", str(source_path), "-t", f"{duration:.6f}",
        "-map", "0:v:0", "-vf", video_filter, "-an", "-c:v", "libx264",
        "-preset", "medium", "-crf", "18", "-movflags", "+faststart", str(output_path),
    ]
    run_command(command)


def assemble_video(clips, transitions, output_path):
    inputs = []
    labels = []
    for clip in clips:
        inputs.extend(["-i", str(clip["path"])])
        labels.append(clip["duration"])
    filters = []
    for index in range(len(clips)):
        filters.append(f"[{index}:v]settb=AVTB,setpts=PTS-STARTPTS[v{index}]")
    current_label = "v0"
    current_duration = labels[0]
    for index, transition in enumerate(transitions, start=1):
        next_label = f"v{index}"
        output_label = f"mix{index}"
        if transition["transition_type"] == "cut":
            filters.append(f"[{current_label}][{next_label}]concat=n=2:v=1:a=0[{output_label}]")
            current_duration += labels[index]
        else:
            fade_duration = float(transition["transition_duration_sec"])
            offset = current_duration - fade_duration
            if offset < 0:
                fail(f"Crossfade {index - 1} starts before the current timeline.")
            filters.append(f"[{current_label}][{next_label}]xfade=transition=fade:duration={fade_duration:.6f}:offset={offset:.6f}[{output_label}]")
            current_duration += labels[index] - fade_duration
        current_label = output_label
    command = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *inputs, "-filter_complex", ";".join(filters), "-map", f"[{current_label}]", "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-r", "30", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(output_path)]
    run_command(command)
    return current_duration


def overlay_text(video_path, cues, working_dir):
    if not cues:
        return video_path
    if not has_drawtext_support():
        logging.warning("FFmpeg drawtext filter is unavailable; skipping %s text cue(s).", len(cues))
        return video_path
    filters = []
    for index, cue in enumerate(cues):
        text = cue.get("text") if isinstance(cue, dict) else None
        start = cue.get("timeline_start_sec") if isinstance(cue, dict) else None
        end = cue.get("timeline_end_sec") if isinstance(cue, dict) else None
        if not isinstance(text, str) or not text or not isinstance(start, (int, float)) or not isinstance(end, (int, float)) or end <= start:
            logging.warning("Skipping invalid text cue at index %s", index)
            continue
        text_path = working_dir / f"text_{index:03d}.txt"
        text_path.write_text(text, encoding="utf-8")
        filters.append(f"drawtext=textfile='{escape_drawtext_path(text_path)}':fontcolor=white:fontsize=56:borderw=3:bordercolor=black@0.75:{placement(cue.get('placement_hint'))}:enable='between(t,{float(start):.6f},{float(end):.6f})'")
    if not filters:
        return video_path
    output_path = working_dir / "text_overlay.mp4"
    run_command(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(video_path), "-vf", ",".join(filters), "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-an", "-movflags", "+faststart", str(output_path)])
    return output_path


def resolve_audio_asset(cue, job_path):
    if not isinstance(cue, dict) or not isinstance(cue.get("asset_ref"), str) or not cue["asset_ref"]:
        return None
    candidate = Path(cue["asset_ref"]).expanduser()
    if not candidate.is_absolute():
        candidate = (job_path.parent / candidate).resolve()
    return candidate if candidate.is_file() else None


def add_audio(video_path, audio_path, output_path, target_duration):
    run_command(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(video_path), "-stream_loop", "-1", "-i", str(audio_path), "-map", "0:v:0", "-map", "1:a:0", "-t", f"{target_duration:.6f}", "-c:v", "copy", "-c:a", "aac", "-af", "apad", "-shortest", str(output_path)])


def probe_duration(path):
    result = run_command(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", str(path)])
    try:
        return float(result.stdout.strip())
    except (TypeError, ValueError):
        fail("Could not read final render duration.")


def render(job_path):
    job, plan = read_job(job_path)
    selected, transitions, target_duration = validate_plan(job, plan)
    output_root_value = job.get("output_root")
    if not isinstance(output_root_value, str) or not output_root_value.strip():
        fail("Job is missing output_root.")
    output_root = Path(output_root_value).expanduser()
    output_root.mkdir(parents=True, exist_ok=True)
    job_id = job.get("job_id")
    if not isinstance(job_id, str) or not job_id:
        fail("Job is missing job_id.")
    output_path = output_root / f"{job_id}.mp4"
    text_audio = plan.get("text_audio") if isinstance(plan.get("text_audio"), dict) else {}
    text_cues = text_audio.get("text_cues") or []
    audio_cues = text_audio.get("audio_cues") or []
    with tempfile.TemporaryDirectory(prefix=f"qn-render-{job_id}-") as temp_dir:
        working_dir = Path(temp_dir)
        clips = []
        for index, (timing_item, source_path) in enumerate(selected):
            clip_path = working_dir / f"clip_{index:03d}.mp4"
            create_clip(source_path, timing_item, clip_path)
            clips.append({"path": clip_path, "duration": float(timing_item["use_duration_sec"])})
        assembled_path = working_dir / "assembled.mp4"
        assemble_duration = assemble_video(clips, transitions, assembled_path)
        if not math.isclose(assemble_duration, target_duration, abs_tol=0.001):
            fail("Render transition math does not match target duration.")
        final_video = overlay_text(assembled_path, text_cues, working_dir)
        usable_audio = next((resolve_audio_asset(cue, job_path) for cue in audio_cues if resolve_audio_asset(cue, job_path)), None)
        if audio_cues and usable_audio is None:
            logging.warning("Audio cues contain no resolvable local asset; rendering valid video without invented audio.")
        if usable_audio:
            with_audio = working_dir / "with_audio.mp4"
            add_audio(final_video, usable_audio, with_audio, target_duration)
            final_video = with_audio
        shutil.copyfile(final_video, output_path)
    if not output_path.is_file() or output_path.stat().st_size == 0:
        fail("Final render output is missing or empty.")
    actual_duration = probe_duration(output_path)
    if abs(actual_duration - target_duration) > DURATION_TOLERANCE_SEC:
        fail(f"Final render duration {actual_duration:.3f}s differs from target {target_duration:.3f}s.")
    return output_path


def main():
    parser = argparse.ArgumentParser(description="Render a canonical QN reel plan.")
    parser.add_argument("--job", required=True, type=Path)
    args = parser.parse_args()
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    try:
        output_path = render(args.job.expanduser().resolve())
        print(json.dumps({"output_path": str(output_path), "output_drive_url": None}, separators=(",", ":")))
    except Exception as exc:
        logging.error("Render failed: %s", exc)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())