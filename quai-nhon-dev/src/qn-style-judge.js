const STYLE_JUDGE_FIELDS = [
  "style_judge_status",
  "sequence_id",
  "style_profile_id",
  "overall_score",
  "decision",
  "criteria_results",
  "issues"
];

const CRITERIA_RESULT_FIELDS = [
  "criterion_id",
  "score",
  "notes"
];

const ISSUE_FIELDS = [
  "issue_id",
  "severity",
  "category",
  "message",
  "shot_id",
  "cue_id"
];

export function createQNStyleJudge({ analyze } = {}) {
  return {
    async evaluate(reelPlan) {
      if (typeof analyze !== "function") {
        return createPendingStyleJudgeResult();
      }

      const judgedResult = await analyze(reelPlan);
      return normalizeStyleJudgeResult(judgedResult, reelPlan);
    }
  };
}

function createPendingStyleJudgeResult() {
  return {
    style_judge_status: "pending",
    sequence_id: null,
    style_profile_id: null,
    overall_score: null,
    decision: "pending",
    criteria_results: [],
    issues: []
  };
}

export function normalizeStyleJudgeResult(result, reelPlan) {
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    throw new TypeError("Style judge analyzer must return an object.");
  }
  if (!Array.isArray(result.criteria_results) || !Array.isArray(result.issues)) {
    throw new TypeError("Style judge analyzer must return criteria_results and issues arrays.");
  }

  const status = result.style_judge_status || "pending";
  if (status !== "pending") {
    if (typeof reelPlan?.sequence_id !== "string" || !reelPlan.sequence_id.trim()) {
      throw new TypeError("A completed reel plan requires a sequence ID.");
    }
    if (result.sequence_id !== reelPlan.sequence_id) {
      throw new TypeError("Style judge output must preserve the reel plan sequence ID.");
    }
  }

  const shotIds = new Set((reelPlan?.shot_timings || []).map(timing => timing.shot_id));
  const cueIds = new Set([
    ...(reelPlan?.text_cues || []).map(cue => cue.cue_id),
    ...(reelPlan?.audio_cues || []).map(cue => cue.cue_id)
  ]);
  validateScore(result.overall_score, "Overall score");
  validateDecision(result.decision);
  validateUniqueIds(result.criteria_results, "criterion_id", "Criterion");
  validateUniqueIds(result.issues, "issue_id", "Issue");

  return {
    style_judge_status: status,
    sequence_id: result.sequence_id ?? null,
    style_profile_id: result.style_profile_id ?? null,
    overall_score: result.overall_score ?? null,
    decision: result.decision || "pending",
    criteria_results: result.criteria_results.map((criterion, index) => normalizeCriterionResult(criterion, index)),
    issues: result.issues.map((issue, index) => normalizeIssue(issue, index, shotIds, cueIds))
  };
}

function normalizeCriterionResult(criterion, index) {
  if (typeof criterion?.criterion_id !== "string" || !criterion.criterion_id.trim()) {
    throw new TypeError(`Criterion at index ${index} must have a non-empty ID.`);
  }
  validateScore(criterion.score, `Criterion score at index ${index}`);
  return {
    criterion_id: criterion.criterion_id,
    score: criterion.score ?? null,
    notes: criterion.notes ?? null
  };
}

function normalizeIssue(issue, index, shotIds, cueIds) {
  if (typeof issue?.issue_id !== "string" || !issue.issue_id.trim()) {
    throw new TypeError(`Issue at index ${index} must have a non-empty ID.`);
  }
  if (issue.shot_id !== null && issue.shot_id !== undefined && !shotIds.has(issue.shot_id)) {
    throw new TypeError(`Issue at index ${index} references an unknown shot ID.`);
  }
  if (issue.cue_id !== null && issue.cue_id !== undefined && !cueIds.has(issue.cue_id)) {
    throw new TypeError(`Issue at index ${index} references an unknown cue ID.`);
  }
  return {
    issue_id: issue.issue_id,
    severity: issue.severity ?? null,
    category: issue.category ?? null,
    message: issue.message ?? null,
    shot_id: issue.shot_id ?? null,
    cue_id: issue.cue_id ?? null
  };
}

function validateScore(score, label) {
  if (score !== null && score !== undefined && (!Number.isFinite(score) || score < 0 || score > 100)) {
    throw new TypeError(`${label} must be a number from 0 to 100.`);
  }
}

function validateDecision(decision) {
  if (decision !== "pending" && decision !== "pass" && decision !== "revise") {
    throw new TypeError("Style judge decision must be pending, pass, or revise.");
  }
}

function validateUniqueIds(items, field, label) {
  const ids = new Set();
  items.forEach((item, index) => {
    if (typeof item?.[field] !== "string" || !item[field].trim()) {
      throw new TypeError(`${label} at index ${index} must have a non-empty ID.`);
    }
    if (ids.has(item[field])) {
      throw new TypeError(`${label} IDs must be unique.`);
    }
    ids.add(item[field]);
  });
}

export { CRITERIA_RESULT_FIELDS, ISSUE_FIELDS, STYLE_JUDGE_FIELDS };
