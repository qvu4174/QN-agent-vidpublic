const TIMING_FIELDS = ["timing_status", "sequence_id", "target_reel_duration_sec", "shot_timings", "transitions"];
const SHOT_TIMING_FIELDS = ["position", "shot_id", "source_id", "source_in_sec", "use_duration_sec", "timeline_start_sec"];
const TRANSITION_FIELDS = ["transition_id", "from_shot_id", "to_shot_id", "transition_type", "transition_duration_sec"];
const TIMING_EPSILON = 0.001;

export function createTimingAgent({ analyze } = {}) {
  return {
    async evaluate(sequenceManifest, shotManifest) {
      if (typeof analyze !== "function") return createPendingTimingResult();
      return normalizeTimingResult(await analyze(sequenceManifest, shotManifest), sequenceManifest, shotManifest);
    }
  };
}

function createPendingTimingResult() {
  return { timing_status: "pending", sequence_id: null, target_reel_duration_sec: null, shot_timings: [], transitions: [] };
}

export function normalizeTimingResult(result, sequenceManifest, shotManifest) {
  if (!result || typeof result !== "object" || Array.isArray(result)) throw new TypeError("Timing analyzer must return an object.");
  if (!Array.isArray(result.shot_timings) || !Array.isArray(result.transitions)) throw new TypeError("Timing analyzer must return shot_timings and transitions arrays.");
  const status = result.timing_status || "pending";
  if (status === "pending") return { timing_status: status, sequence_id: result.sequence_id ?? null, target_reel_duration_sec: result.target_reel_duration_sec ?? null, shot_timings: result.shot_timings, transitions: result.transitions };
  const sequenceShots = validateSequenceManifest(sequenceManifest);
  const sourceShots = validateShotManifest(shotManifest);
  const targetDuration = result.target_reel_duration_sec;
  if (result.sequence_id !== sequenceManifest.sequence_id) throw new TypeError("Timing output must preserve the Step 8 sequence ID.");
  if (!Number.isFinite(targetDuration) || targetDuration <= 0) throw new TypeError("Non-pending timing output requires a positive target reel duration.");
  if (result.shot_timings.length !== sequenceShots.length) throw new TypeError("Timing output must contain exactly the Step 8 ordered shots.");
  const shotTimings = result.shot_timings.map((timing, index) => normalizeShotTiming(timing, index, sequenceShots[index], sourceShots, targetDuration));
  if (shotTimings.length && !withinTimingTolerance(shotTimings[0].timeline_start_sec, 0)) throw new TypeError("The first shot must start at timeline position zero.");
  const transitions = normalizeTransitions(result.transitions, shotTimings);
  validateFinalDuration(targetDuration, shotTimings, transitions);
  return { timing_status: status, sequence_id: sequenceManifest.sequence_id, target_reel_duration_sec: targetDuration, shot_timings: shotTimings, transitions };
}

function validateSequenceManifest(sequenceManifest) {
  if (!sequenceManifest || typeof sequenceManifest.sequence_id !== "string" || !sequenceManifest.sequence_id.trim() || !Array.isArray(sequenceManifest.ordered_shots)) throw new TypeError("Step 8 sequence manifest is invalid.");
  const seen = new Set();
  return sequenceManifest.ordered_shots.map((shot, index) => {
    if (typeof shot?.shot_id !== "string" || !shot.shot_id.trim() || typeof shot?.source_id !== "string" || !shot.source_id.trim()) throw new TypeError(`Step 8 shot at index ${index} is missing its identity.`);
    if (!Number.isInteger(shot.position) || shot.position !== index + 1) throw new TypeError(`Step 8 shot at index ${index} has an invalid position.`);
    if (seen.has(shot.shot_id)) throw new TypeError(`Step 8 shot at index ${index} duplicates its shot ID.`);
    seen.add(shot.shot_id);
    return shot;
  });
}

function validateShotManifest(shotManifest) {
  if (!shotManifest || !Array.isArray(shotManifest.shots)) throw new TypeError("Step 2 shot manifest is invalid.");
  const shots = new Map();
  shotManifest.shots.forEach((shot, index) => {
    if (typeof shot?.shot_id !== "string" || !shot.shot_id.trim() || typeof shot?.source_id !== "string" || !shot.source_id.trim() || !Number.isFinite(shot.start_sec) || !Number.isFinite(shot.end_sec) || shot.end_sec < shot.start_sec) throw new TypeError(`Step 2 shot at index ${index} is invalid.`);
    if (shots.has(shot.shot_id)) throw new TypeError(`Step 2 shot at index ${index} duplicates its shot ID.`);
    shots.set(shot.shot_id, shot);
  });
  return shots;
}

function normalizeShotTiming(timing, index, sequenceShot, sourceShots, targetDuration) {
  if (!timing || timing.position !== sequenceShot.position || timing.shot_id !== sequenceShot.shot_id || timing.source_id !== sequenceShot.source_id) throw new TypeError(`Timing shot at index ${index} does not exactly match the Step 8 sequence.`);
  const sourceShot = sourceShots.get(timing.shot_id);
  if (!sourceShot) throw new TypeError(`Timing shot at index ${index} is not present in the Step 2 shot manifest.`);
  if (sourceShot.source_id !== timing.source_id) throw new TypeError(`Timing shot at index ${index} does not match its Step 2 source.`);
  if (!Number.isFinite(timing.source_in_sec) || !Number.isFinite(timing.use_duration_sec) || timing.use_duration_sec <= 0 || timing.source_in_sec < sourceShot.start_sec || timing.source_in_sec + timing.use_duration_sec > sourceShot.end_sec) throw new TypeError(`Timing shot at index ${index} exceeds its Step 2 source boundaries.`);
  if (!Number.isFinite(timing.timeline_start_sec) || timing.timeline_start_sec < 0 || timing.timeline_start_sec + timing.use_duration_sec > targetDuration + TIMING_EPSILON) throw new TypeError(`Timing shot at index ${index} exceeds the target reel duration.`);
  return { position: timing.position, shot_id: timing.shot_id, source_id: timing.source_id, source_in_sec: timing.source_in_sec, use_duration_sec: timing.use_duration_sec, timeline_start_sec: timing.timeline_start_sec };
}

function normalizeTransitions(transitions, shotTimings) {
  if (transitions.length !== Math.max(0, shotTimings.length - 1)) throw new TypeError("Timing output must contain one transition per adjacent shot pair.");
  const ids = new Set();
  return transitions.map((transition, index) => {
    const current = shotTimings[index];
    const next = shotTimings[index + 1];
    if (typeof transition?.transition_id !== "string" || !transition.transition_id.trim() || ids.has(transition.transition_id)) throw new TypeError(`Transition at index ${index} must have a unique non-empty ID.`);
    if (transition.from_shot_id !== current.shot_id || transition.to_shot_id !== next.shot_id) throw new TypeError(`Transition at index ${index} must connect adjacent Step 8 shots.`);
    if (transition.transition_type !== "cut" && transition.transition_type !== "crossfade") throw new TypeError(`Transition at index ${index} has an unsupported type.`);
    if (!Number.isFinite(transition.transition_duration_sec) || transition.transition_duration_sec < 0 || transition.transition_duration_sec > current.use_duration_sec || transition.transition_duration_sec > next.use_duration_sec) throw new TypeError(`Transition at index ${index} has an invalid duration.`);
    if (transition.transition_type === "cut" && !withinTimingTolerance(transition.transition_duration_sec, 0)) throw new TypeError("Cut transitions must have zero duration.");
    if (transition.transition_type === "crossfade" && transition.transition_duration_sec <= 0) throw new TypeError("Crossfade transitions must have a positive duration.");
    const expectedStart = current.timeline_start_sec + current.use_duration_sec - transition.transition_duration_sec;
    if (!withinTimingTolerance(next.timeline_start_sec, expectedStart)) throw new TypeError(`Transition at index ${index} does not match the shot timeline positions.`);
    ids.add(transition.transition_id);
    return { transition_id: transition.transition_id, from_shot_id: transition.from_shot_id, to_shot_id: transition.to_shot_id, transition_type: transition.transition_type, transition_duration_sec: transition.transition_duration_sec };
  });
}

function withinTimingTolerance(actual, expected) {
  return Math.abs(actual - expected) <= TIMING_EPSILON + 1e-12;
}

function validateFinalDuration(targetDuration, shotTimings, transitions) {
  const finalShot = shotTimings[shotTimings.length - 1];
  const finalTimelineEnd = finalShot.timeline_start_sec + finalShot.use_duration_sec;
  if (!withinTimingTolerance(targetDuration, finalTimelineEnd)) throw new TypeError("Target reel duration must equal the final shot timeline end.");
  const usedDuration = shotTimings.reduce((total, shot) => total + shot.use_duration_sec, 0);
  const crossfadeDuration = transitions.reduce((total, transition) => total + (transition.transition_type === "crossfade" ? transition.transition_duration_sec : 0), 0);
  if (!withinTimingTolerance(targetDuration, usedDuration - crossfadeDuration)) throw new TypeError("Target reel duration does not match the shot duration sum.");
  for (let index = 1; index < shotTimings.length - 1; index++) {
    const incoming = transitions[index - 1];
    const outgoing = transitions[index];
    const overlap = (incoming.transition_type === "crossfade" ? incoming.transition_duration_sec : 0) + (outgoing.transition_type === "crossfade" ? outgoing.transition_duration_sec : 0);
    if (overlap - shotTimings[index].use_duration_sec > TIMING_EPSILON) throw new TypeError(`Interior shot at index ${index} has excessive crossfade overlap.`);
  }
}

export { SHOT_TIMING_FIELDS, TIMING_FIELDS, TRANSITION_FIELDS };
