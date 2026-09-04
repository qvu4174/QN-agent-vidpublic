const RENDER_VERIFICATION_FIELDS = [
  "render_verification_status",
  "plan_id",
  "sequence_id",
  "render_artifact",
  "decision",
  "checks",
  "issues"
];

export function createRenderVerificationAgent({ analyze } = {}) {
  return {
    async evaluate(input) {
      const context = validateInput(input);
      if (typeof analyze !== "function") {
        return createPendingVerificationResult(context);
      }

      const verificationResult = await analyze(input);
      return normalizeVerificationResult(verificationResult, context);
    }
  };
}

function validateInput(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("Render verification input must be an object.");
  }
  if (typeof input.plan_id !== "string" || !input.plan_id.trim()) {
    throw new TypeError("Render verification input requires a plan ID.");
  }
  if (typeof input.sequence_id !== "string" || !input.sequence_id.trim()) {
    throw new TypeError("Render verification input requires a sequence ID.");
  }
  if (!input.render_artifact || typeof input.render_artifact !== "object" || Array.isArray(input.render_artifact)) {
    throw new TypeError("Render verification input requires a render artifact reference.");
  }
  return input;
}

function createPendingVerificationResult(context) {
  return {
    render_verification_status: "pending",
    plan_id: context.plan_id,
    sequence_id: context.sequence_id,
    render_artifact: clone(context.render_artifact),
    decision: "pending",
    checks: [],
    issues: []
  };
}

export function normalizeVerificationResult(result, context) {
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    throw new TypeError("Render verifier must return an object.");
  }
  if (!Array.isArray(result.checks) || !Array.isArray(result.issues)) {
    throw new TypeError("Render verifier must return checks and issues arrays.");
  }
  const status = result.render_verification_status || "pending";
  const decision = result.decision || "pending";
  if (decision !== "pending" && decision !== "pass" && decision !== "revise") {
    throw new TypeError("Render verification decision must be pending, pass, or revise.");
  }
  if (status !== "pending") {
    if (result.plan_id !== context.plan_id) {
      throw new TypeError("Render verification must preserve the plan ID.");
    }
    if (result.sequence_id !== context.sequence_id) {
      throw new TypeError("Render verification must preserve the sequence ID.");
    }
  }
  return {
    render_verification_status: status,
    plan_id: result.plan_id ?? context.plan_id,
    sequence_id: result.sequence_id ?? context.sequence_id,
    render_artifact: clone(result.render_artifact ?? context.render_artifact),
    decision,
    checks: clone(result.checks),
    issues: clone(result.issues)
  };
}

function clone(value) {
  return value === undefined ? undefined : structuredClone(value);
}

export { RENDER_VERIFICATION_FIELDS };
