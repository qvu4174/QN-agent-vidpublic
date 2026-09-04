const SHOT_RANKING_FIELDS = [
  "shot_id",
  "source_id",
  "story_relevance_score",
  "visual_strength_score",
  "ranking_score",
  "ranking_status"
];

export function createShotRankingAgent({ analyze } = {}) {
  return {
    async evaluate(shotManifest) {
      const shots = validateShotManifest(shotManifest);
      const pendingShots = shots.map(createPendingRankingResult);

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
        throw new TypeError("Shot ranking analyzer must return an array.");
      }
      return {
        status: analyzedShots.length ? "completed" : "pending",
        input_step: "02_shot_detection",
        input_job_id: shotManifest?.input_job_id || null,
        shots: analyzedShots.map(normalizeRankingResult)
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

function createPendingRankingResult(shot) {
  return {
    shot_id: shot.shot_id,
    source_id: shot.source_id,
    story_relevance_score: null,
    visual_strength_score: null,
    ranking_score: null,
    ranking_status: "pending"
  };
}

export function normalizeRankingResult(result, index = 0) {
  if (!result?.shot_id || !result?.source_id) {
    throw new TypeError(`Ranking result at index ${index} is missing its identity.`);
  }
  return {
    shot_id: result.shot_id,
    source_id: result.source_id,
    story_relevance_score: result.story_relevance_score ?? null,
    visual_strength_score: result.visual_strength_score ?? null,
    ranking_score: result.ranking_score ?? null,
    ranking_status: result.ranking_status || "pending"
  };
}

export { SHOT_RANKING_FIELDS };
