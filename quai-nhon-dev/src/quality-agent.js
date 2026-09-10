const QUALITY_FIELDS = [
  "shot_id",
  "source_id",
  "sharpness_score",
  "stability_score",
  "exposure_score",
  "overall_quality_score",
  "quality_flags"
];
const QUALITY_SCORE_FIELDS = [
  "sharpness_score",
  "stability_score",
  "exposure_score",
  "overall_quality_score"
];
const QUALITY_SCORE_MIN = 0;
const QUALITY_SCORE_MAX = 100;

export function createQualityAgent({ analyze } = {}) {
  return {
    async evaluate(shotManifest) {
      const shots = validateShotManifest(shotManifest);
      const qualityShots = shots.map(createPendingQualityResult);

      if (typeof analyze !== "function") {
        return {
          status: "pending",
          input_step: "02_shot_detection",
          input_job_id: shotManifest?.input_job_id || null,
          shots: qualityShots
        };
      }

      const analyzedShots = await analyze(shotManifest);
      if (!Array.isArray(analyzedShots)) {
        throw new TypeError("Quality analyzer must return an array.");
      }
      if (analyzedShots.length !== shots.length) {
        throw new TypeError("Quality analyzer must return exactly one result for every Step 2 shot.");
      }
      const expectedShots = new Map(shots.map(shot => [shot.shot_id, shot]));
      const seenShotIds = new Set();
      return {
        status: analyzedShots.length ? "completed" : "pending",
        input_step: "02_shot_detection",
        input_job_id: shotManifest?.input_job_id || null,
        shots: analyzedShots.map((shot, index) => {
          const normalized = normalizeQualityResult(shot, index);
          if (seenShotIds.has(normalized.shot_id)) {
            throw new TypeError(`Quality result at index ${index} duplicates its shot ID.`);
          }
          seenShotIds.add(normalized.shot_id);
          const expectedShot = expectedShots.get(normalized.shot_id);
          if (!expectedShot || expectedShot.source_id !== normalized.source_id) {
            throw new TypeError(`Quality result at index ${index} does not match a Step 2 shot.`);
          }
          return normalized;
        })
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

function createPendingQualityResult(shot) {
  return {
    shot_id: shot.shot_id,
    source_id: shot.source_id,
    sharpness_score: null,
    stability_score: null,
    exposure_score: null,
    overall_quality_score: null,
    quality_flags: []
  };
}

export function normalizeQualityResult(result, index = 0) {
  if (!result?.shot_id || !result?.source_id) {
    throw new TypeError(`Quality result at index ${index} is missing its identity.`);
  }
  QUALITY_SCORE_FIELDS.forEach(field => {
    if (!Number.isFinite(result[field]) || result[field] < QUALITY_SCORE_MIN || result[field] > QUALITY_SCORE_MAX) {
      throw new TypeError(`Quality result at index ${index} has an invalid ${field}.`);
    }
  });
  return {
    shot_id: result.shot_id,
    source_id: result.source_id,
    sharpness_score: result.sharpness_score ?? null,
    stability_score: result.stability_score ?? null,
    exposure_score: result.exposure_score ?? null,
    overall_quality_score: result.overall_quality_score ?? null,
    quality_flags: Array.isArray(result.quality_flags) ? result.quality_flags : []
  };
}

export { QUALITY_FIELDS };
