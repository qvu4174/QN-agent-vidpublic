const STORY_FIELDS = [
  "status",
  "story_goal",
  "story_theme",
  "story_arc",
  "tone"
];

export function createStoryAgent({ analyze } = {}) {
  return {
    async evaluate(input) {
      if (typeof analyze !== "function") {
        return createPendingStoryResult();
      }

      const analyzedStory = await analyze(input);
      return normalizeStoryResult(analyzedStory);
    }
  };
}

function createPendingStoryResult() {
  return {
    status: "pending",
    story_goal: null,
    story_theme: null,
    story_arc: {
      opening: null,
      development: null,
      ending: null
    },
    tone: null
  };
}

export function normalizeStoryResult(result) {
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    throw new TypeError("Story analyzer must return an object.");
  }
  return {
    status: result.status || "completed",
    story_goal: result.story_goal ?? null,
    story_theme: result.story_theme ?? null,
    story_arc: normalizeStoryArc(result.story_arc),
    tone: result.tone ?? null
  };
}

function normalizeStoryArc(storyArc) {
  return {
    opening: storyArc?.opening ?? null,
    development: storyArc?.development ?? null,
    ending: storyArc?.ending ?? null
  };
}

export { STORY_FIELDS };
