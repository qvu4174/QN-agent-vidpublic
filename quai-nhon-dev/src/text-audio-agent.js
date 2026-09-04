const TEXT_AUDIO_FIELDS = [
  "text_audio_status",
  "sequence_id",
  "text_cues",
  "audio_cues"
];

const TEXT_CUE_FIELDS = [
  "cue_id",
  "shot_id",
  "text",
  "language",
  "timeline_start_sec",
  "timeline_end_sec",
  "placement_hint"
];

const AUDIO_CUE_FIELDS = [
  "cue_id",
  "audio_type",
  "shot_id",
  "asset_ref",
  "script",
  "timeline_start_sec",
  "timeline_end_sec",
  "gain_db"
];

export function createTextAudioAgent({ analyze } = {}) {
  return {
    async evaluate(timedSequence) {
      if (typeof analyze !== "function") {
        return createPendingTextAudioResult();
      }

      const analyzedCues = await analyze(timedSequence);
      return normalizeTextAudioResult(analyzedCues, timedSequence);
    }
  };
}

function createPendingTextAudioResult() {
  return {
    text_audio_status: "pending",
    sequence_id: null,
    text_cues: [],
    audio_cues: []
  };
}

export function normalizeTextAudioResult(result, timedSequence) {
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    throw new TypeError("Text/audio analyzer must return an object.");
  }
  if (!Array.isArray(result.text_cues) || !Array.isArray(result.audio_cues)) {
    throw new TypeError("Text/audio analyzer must return text_cues and audio_cues arrays.");
  }

  const targetDuration = timedSequence?.target_reel_duration_sec;
  const shotIds = new Set((timedSequence?.shot_timings || []).map(timing => timing.shot_id));
  if (!Number.isFinite(targetDuration) || targetDuration < 0) {
    throw new TypeError("A valid Step 9 target reel duration is required.");
  }
  const textAudioStatus = result.text_audio_status || "pending";
  if (textAudioStatus !== "pending" && result.sequence_id !== timedSequence?.sequence_id) {
    throw new TypeError("Non-pending text/audio output must preserve the Step 9 sequence ID.");
  }
  validateCueIds(result.text_cues, "Text");
  validateCueIds(result.audio_cues, "Audio");

  return {
    text_audio_status: textAudioStatus,
    sequence_id: result.sequence_id ?? null,
    text_cues: result.text_cues.map((cue, index) => normalizeTextCue(cue, index, targetDuration, shotIds)),
    audio_cues: result.audio_cues.map((cue, index) => normalizeAudioCue(cue, index, targetDuration, shotIds))
  };
}

function normalizeTextCue(cue, index, targetDuration, shotIds) {
  validateCueIdentity(cue, index, "Text");
  validateCueShot(cue, index, shotIds, "Text");
  validateCueRange(cue, index, targetDuration, "Text");
  return {
    cue_id: cue.cue_id,
    shot_id: cue.shot_id ?? null,
    text: cue.text ?? null,
    language: cue.language ?? null,
    timeline_start_sec: cue.timeline_start_sec,
    timeline_end_sec: cue.timeline_end_sec,
    placement_hint: cue.placement_hint ?? null
  };
}

function normalizeAudioCue(cue, index, targetDuration, shotIds) {
  validateCueIdentity(cue, index, "Audio");
  validateCueShot(cue, index, shotIds, "Audio");
  validateCueRange(cue, index, targetDuration, "Audio");
  return {
    cue_id: cue.cue_id,
    audio_type: cue.audio_type ?? null,
    shot_id: cue.shot_id ?? null,
    asset_ref: cue.asset_ref ?? null,
    script: cue.script ?? null,
    timeline_start_sec: cue.timeline_start_sec,
    timeline_end_sec: cue.timeline_end_sec,
    gain_db: cue.gain_db ?? null
  };
}

function validateCueIdentity(cue, index, type) {
  if (typeof cue?.cue_id !== "string" || !cue.cue_id.trim()) {
    throw new TypeError(`${type} cue at index ${index} is missing its cue ID.`);
  }
}

function validateCueIds(cues, type) {
  const cueIds = new Set();
  cues.forEach((cue, index) => {
    validateCueIdentity(cue, index, type);
    if (cueIds.has(cue.cue_id)) {
      throw new TypeError(`${type} cue IDs must be unique within their array.`);
    }
    cueIds.add(cue.cue_id);
  });
}

function validateCueShot(cue, index, shotIds, type) {
  if (cue.shot_id !== null && cue.shot_id !== undefined && !shotIds.has(cue.shot_id)) {
    throw new TypeError(`${type} cue at index ${index} references an unknown shot ID.`);
  }
}

function validateCueRange(cue, index, targetDuration, type) {
  const start = cue.timeline_start_sec;
  const end = cue.timeline_end_sec;
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end < start || end > targetDuration) {
    throw new TypeError(`${type} cue at index ${index} has an invalid timeline range.`);
  }
}

export { AUDIO_CUE_FIELDS, TEXT_AUDIO_FIELDS, TEXT_CUE_FIELDS };
