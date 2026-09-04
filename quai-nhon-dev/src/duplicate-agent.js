const DUPLICATE_FIELDS = [
  "shot_id",
  "source_id",
  "duplicate_group_id",
  "duplicate_of_shot_id",
  "similarity_score",
  "duplicate_status"
];

export function createDuplicateAgent() {
  return {
    evaluate(shotManifest) {
      const shots = validateShotManifest(shotManifest);
      return {
        status: "pending",
        input_step: "02_shot_detection",
        input_job_id: shotManifest?.input_job_id || null,
        shots: shots.map(createPendingDuplicateResult)
      };
    }
  };
}

function validateShotManifest(shotManifest) {
  if (!shotManifest || !Array.isArray(shotManifest.shots)) {
    throw new TypeError("A shot manifest with a shots array is required.");
  }
  return shotManifest.shots.map((shot, index) => {
    if (!shot?.shot_id || !shot?.source_id) {
      throw new TypeError(`Shot at index ${index} is missing its identity.`);
    }
    return shot;
  });
}

function createPendingDuplicateResult(shot) {
  return {
    shot_id: shot.shot_id,
    source_id: shot.source_id,
    duplicate_group_id: null,
    duplicate_of_shot_id: null,
    similarity_score: null,
    duplicate_status: "pending"
  };
}

export { DUPLICATE_FIELDS };
