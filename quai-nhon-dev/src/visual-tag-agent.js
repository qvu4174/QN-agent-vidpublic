const VISUAL_TAG_FIELDS = [
  "shot_id",
  "source_id",
  "visual_tags",
  "primary_subject",
  "setting",
  "action"
];

export function createVisualTagAgent({ analyze } = {}) {
  return {
    async evaluate(shotManifest) {
      const shots = validateShotManifest(shotManifest);
      const pendingShots = shots.map(createPendingVisualTagResult);

      if (typeof analyze !== "function") {
        return {
          status: "pending",
          input_step: "02_shot_detection",
          input_job_id: shotManifest?.input_job_id || null,
          shots: pendingShots
        };
      }

      const analyzedShots = await analyze(shotManifest);
      if (!Array.isArray(analyzedShots)) {
        throw new TypeError("Visual tag analyzer must return an array.");
      }
      return {
        status: analyzedShots.length ? "completed" : "pending",
        input_step: "02_shot_detection",
        input_job_id: shotManifest?.input_job_id || null,
        shots: analyzedShots.map(normalizeVisualTagResult)
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

function createPendingVisualTagResult(shot) {
  return {
    shot_id: shot.shot_id,
    source_id: shot.source_id,
    visual_tags: [],
    primary_subject: null,
    setting: null,
    action: null
  };
}

export function normalizeVisualTagResult(result, index = 0) {
  if (!result?.shot_id || !result?.source_id) {
    throw new TypeError(`Visual tag result at index ${index} is missing its identity.`);
  }
  return {
    shot_id: result.shot_id,
    source_id: result.source_id,
    visual_tags: Array.isArray(result.visual_tags) ? result.visual_tags : [],
    primary_subject: result.primary_subject ?? null,
    setting: result.setting ?? null,
    action: result.action ?? null
  };
}

export { VISUAL_TAG_FIELDS };
