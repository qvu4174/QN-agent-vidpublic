const HUMAN_FEEDBACK_FIELDS = [
  "feedback_status",
  "plan_id",
  "sequence_id",
  "decision",
  "feedback_items",
  "notes"
];

export function createHumanFeedbackAgent({ analyze } = {}) {
  return {
    async evaluate(input) {
      const context = validateInput(input);
      if (typeof analyze !== "function") {
        return createPendingFeedbackResult(context);
      }

      const feedbackResult = await analyze(input);
      return normalizeFeedbackResult(feedbackResult, context);
    }
  };
}

function validateInput(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("Human feedback input must be an object.");
  }
  if (typeof input.plan_id !== "string" || !input.plan_id.trim()) {
    throw new TypeError("Human feedback input requires a plan ID.");
  }
  if (typeof input.sequence_id !== "string" || !input.sequence_id.trim()) {
    throw new TypeError("Human feedback input requires a sequence ID.");
  }
  if (!input.render_artifact || typeof input.render_artifact !== "object" || Array.isArray(input.render_artifact)) {
    throw new TypeError("Human feedback input requires a render artifact reference.");
  }
  if (!input.render_verification || typeof input.render_verification !== "object" || Array.isArray(input.render_verification)) {
    throw new TypeError("Human feedback input requires a Step 12 verification result.");
  }
  return input;
}

function createPendingFeedbackResult(context) {
  return {
    feedback_status: "pending",
    plan_id: context.plan_id,
    sequence_id: context.sequence_id,
    decision: "pending",
    feedback_items: [],
    notes: null
  };
}

export function normalizeFeedbackResult(result, context) {
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    throw new TypeError("Human feedback analyzer must return an object.");
  }
  if (!Array.isArray(result.feedback_items)) {
    throw new TypeError("Human feedback analyzer must return a feedback_items array.");
  }
  const decision = result.decision || "pending";
  if (!["pending", "approve", "revise", "reject"].includes(decision)) {
    throw new TypeError("Human feedback decision must be pending, approve, revise, or reject.");
  }
  const status = result.feedback_status || "pending";
  if (status !== "pending") {
    if (result.plan_id !== context.plan_id) {
      throw new TypeError("Human feedback must preserve the plan ID.");
    }
    if (result.sequence_id !== context.sequence_id) {
      throw new TypeError("Human feedback must preserve the sequence ID.");
    }
  }
  return {
    feedback_status: status,
    plan_id: result.plan_id ?? context.plan_id,
    sequence_id: result.sequence_id ?? context.sequence_id,
    decision,
    feedback_items: clone(result.feedback_items),
    notes: result.notes ?? null
  };
}

function clone(value) {
  return value === undefined ? undefined : structuredClone(value);
}

export { HUMAN_FEEDBACK_FIELDS };
