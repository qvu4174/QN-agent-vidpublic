const SHOT_FIELDS = [
  "shot_id",
  "source_id",
  "start_sec",
  "end_sec",
  "duration_sec"
];

/**
 * Create the isolated Step 2 detector boundary.
 * A real detector can be injected later without coupling this contract to the UI.
 */
export function createShotDetector({ detect } = {}) {
  return {
    async detectShots(localVideoPath, sourceId) {
      if (typeof localVideoPath !== "string" || !localVideoPath.trim()) {
        throw new TypeError("A local video file path is required.");
      }
      if (typeof sourceId !== "string" || !sourceId.trim()) {
        throw new TypeError("A source ID is required.");
      }
      if (typeof detect !== "function") {
        throw new Error("Shot detector is not connected.");
      }

      const shots = await detect(localVideoPath, sourceId);
      if (!Array.isArray(shots)) {
        throw new TypeError("Shot detector must return an array.");
      }
      return shots.map((shot, index) => normalizeShot(shot, sourceId, index));
    }
  };
}

/**
 * Normalize one future detector result to the Step 2 shot contract.
 */
export function normalizeShot(shot, sourceId, index = 0) {
  const startSec = Number(shot?.start_sec);
  const endSec = Number(shot?.end_sec);
  if (!Number.isFinite(startSec) || !Number.isFinite(endSec) || endSec < startSec) {
    throw new TypeError("Shot boundaries must be finite and ordered.");
  }

  const durationSec = Number(shot?.duration_sec);
  return {
    shot_id: shot?.shot_id || `${sourceId}_shot_${String(index + 1).padStart(3, "0")}`,
    source_id: shot?.source_id || sourceId,
    start_sec: startSec,
    end_sec: endSec,
    duration_sec: Number.isFinite(durationSec) ? durationSec : endSec - startSec
  };
}

export { SHOT_FIELDS };
