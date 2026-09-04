const SEQUENCE_FIELDS = [
  "sequence_id",
  "ordered_shots",
  "sequence_status"
];

const ORDERED_SHOT_FIELDS = [
  "position",
  "shot_id",
  "source_id"
];

export function createSequenceAgent({ analyze } = {}) {
  return {
    async evaluate(input) {
      if (typeof analyze !== "function") {
        return createPendingSequenceResult();
      }

      const rankedShots = validateRankingInput(input);
      const analyzedSequence = await analyze(input);
      return normalizeSequenceResult(analyzedSequence, rankedShots);
    }
  };
}

function createPendingSequenceResult() {
  return {
    sequence_id: null,
    ordered_shots: [],
    sequence_status: "pending"
  };
}

export function normalizeSequenceResult(result, rankedShots = []) {
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    throw new TypeError("Sequence analyzer must return an object.");
  }
  if (!Array.isArray(result.ordered_shots)) {
    throw new TypeError("Sequence analyzer must return an ordered_shots array.");
  }
  const sequenceStatus = result.sequence_status || "pending";
  if (sequenceStatus !== "pending") {
    if (typeof result.sequence_id !== "string" || !result.sequence_id.trim()) {
      throw new TypeError("Non-pending sequences require a non-empty sequence ID.");
    }
    if (!result.ordered_shots.length) {
      throw new TypeError("Non-pending sequences require at least one ordered shot.");
    }
  }
  const rankedShotsById = new Map(rankedShots.map(shot => [shot.shot_id, shot]));
  const seenShotIds = new Set();
  const orderedShots = result.ordered_shots.map((shot, index) => normalizeOrderedShot(shot, index, rankedShotsById, seenShotIds));
  return {
    sequence_id: result.sequence_id ?? null,
    ordered_shots: orderedShots,
    sequence_status: sequenceStatus
  };
}

function validateRankingInput(input) {
  if (!input || !Array.isArray(input.shots)) {
    throw new TypeError("Step 8 requires a Step 7 ranking result with a shots array.");
  }
  const seenShotIds = new Set();
  return input.shots.map((shot, index) => {
    if (typeof shot?.shot_id !== "string" || !shot.shot_id.trim() || typeof shot?.source_id !== "string" || !shot.source_id.trim()) {
      throw new TypeError(`Ranked shot at index ${index} is missing its identity.`);
    }
    if (seenShotIds.has(shot.shot_id)) {
      throw new TypeError(`Ranked shot at index ${index} duplicates its shot ID.`);
    }
    seenShotIds.add(shot.shot_id);
    return shot;
  });
}

function normalizeOrderedShot(shot, index, rankedShotsById, seenShotIds) {
  if (!shot?.shot_id || !shot?.source_id) {
    throw new TypeError(`Ordered shot at index ${index} is missing its identity.`);
  }
  const position = Number(shot.position);
  if (!Number.isInteger(shot.position) || position !== index + 1) {
    throw new TypeError(`Ordered shot at index ${index} must have contiguous position ${index + 1}.`);
  }
  const rankedShot = rankedShotsById.get(shot.shot_id);
  if (!rankedShot) {
    throw new TypeError(`Ordered shot at index ${index} is not present in the Step 7 ranking input.`);
  }
  if (rankedShot.source_id !== shot.source_id) {
    throw new TypeError(`Ordered shot at index ${index} does not match its ranked source.`);
  }
  if (seenShotIds.has(shot.shot_id)) {
    throw new TypeError(`Ordered shot at index ${index} duplicates its shot ID.`);
  }
  seenShotIds.add(shot.shot_id);
  return {
    position,
    shot_id: shot.shot_id,
    source_id: shot.source_id
  };
}

export { ORDERED_SHOT_FIELDS, SEQUENCE_FIELDS };
