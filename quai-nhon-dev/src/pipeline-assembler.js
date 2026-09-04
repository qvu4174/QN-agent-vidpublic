const SHOT_ENRICHMENT_KEYS = ["quality", "visual_tag", "duplicate"];

export function canonicalizeSources(sourceManifest) {
  const sourceItems = Array.isArray(sourceManifest) ? sourceManifest : sourceManifest?.sources || sourceManifest?.clips;
  if (!Array.isArray(sourceItems)) {
    throw new TypeError("Step 1 manifest must contain a sources or clips array.");
  }
  return sourceItems.map((source, index) => {
    const sourceId = source.source_id;
    if (typeof sourceId !== "string" || !sourceId.trim()) {
      throw new TypeError(`Source at index ${index} is missing its source ID.`);
    }
    return {
      source_id: sourceId,
      drive_file_id: source.drive_file_id ?? null,
      drive_path: source.drive_path ?? null,
      filename: source.filename ?? source.name ?? null,
      mime_type: source.mime_type ?? source.mimeType ?? null,
      size_bytes: source.size_bytes ?? source.sizeBytes ?? null,
      duration_sec: source.duration_sec ?? source.durationSec ?? null,
      resolution: source.resolution ?? null,
      fps: source.fps ?? null,
      local_path: source.local_path ?? null,
      local_ready: source.local_ready ?? false
    };
  });
}

export function canonicalizeShots(shotManifest) {
  const shots = Array.isArray(shotManifest) ? shotManifest : shotManifest?.shots;
  if (!Array.isArray(shots)) {
    throw new TypeError("Step 2 output must be a shots array or a manifest with shots.");
  }
  return shots.map((shot, index) => {
    if (typeof shot?.shot_id !== "string" || !shot.shot_id.trim() || typeof shot?.source_id !== "string" || !shot.source_id.trim()) {
      throw new TypeError(`Step 2 shot at index ${index} is missing its identity.`);
    }
    return { ...shot };
  });
}

export function mergeShotEnrichment(shots, ...enrichmentResults) {
  const canonicalShots = canonicalizeShots(shots);
  const shotIndex = new Map(canonicalShots.map(shot => [shotKey(shot), shot]));
  const merged = canonicalShots.map(shot => ({ ...shot }));

  enrichmentResults.forEach((result, resultIndex) => {
    const enrichmentShots = result?.shots || result;
    if (!Array.isArray(enrichmentShots)) {
      throw new TypeError(`Shot enrichment ${resultIndex + 1} must contain a shots array.`);
    }
    enrichmentShots.forEach((enrichment, index) => {
      const key = shotKey(enrichment);
      if (!shotIndex.has(key)) {
        throw new TypeError(`Shot enrichment ${resultIndex + 1} at index ${index} does not match a Step 2 shot.`);
      }
      const targetIndex = merged.findIndex(shot => shotKey(shot) === key);
      const target = merged[targetIndex];
      merged[targetIndex] = {
        ...target,
        [enrichmentKey(resultIndex)]: { ...enrichment }
      };
    });
  });
  return merged;
}

export function buildStoryInput(sources, shots) {
  return { sources: canonicalizeSources(sources), shots: canonicalizeShots(shots) };
}

export function buildRankingInput(story, sources, shots) {
  return { story: story ?? null, sources: canonicalizeSources(sources), shots: canonicalizeShots(shots) };
}

export function buildSequenceInput(rankingResult) {
  const shots = rankingResult?.shots;
  if (!Array.isArray(shots)) {
    throw new TypeError("Step 7 ranking result must contain a shots array.");
  }
  return { ...rankingResult, shots: shots.map(shot => ({ ...shot })) };
}

export function buildTimingInputs(sequenceManifest, shots) {
  return {
    sequenceManifest: { ...sequenceManifest, ordered_shots: sequenceManifest?.ordered_shots?.map(shot => ({ ...shot })) || [] },
    shotManifest: { shots: canonicalizeShots(shots) }
  };
}

export function buildTextAudioInput(timingResult) {
  return {
    ...timingResult,
    shot_timings: timingResult?.shot_timings?.map(shot => ({ ...shot })) || [],
    transitions: timingResult?.transitions?.map(transition => ({ ...transition })) || []
  };
}

export function assembleReelPlan({ job_id, plan_id, sources, shots, story, ranking, sequence, timing, text_audio }) {
  if (typeof job_id !== "string" || !job_id.trim()) {
    throw new TypeError("A completed reel plan requires a caller-supplied job_id.");
  }
  if (typeof plan_id !== "string" || !plan_id.trim()) {
    throw new TypeError("A completed reel plan requires a caller-supplied plan_id.");
  }
  if (!sequence || typeof sequence.sequence_id !== "string" || !sequence.sequence_id.trim()) {
    throw new TypeError("A completed reel plan requires sequence.sequence_id.");
  }
  if (timing?.sequence_id !== sequence.sequence_id || text_audio?.sequence_id !== sequence.sequence_id) {
    throw new TypeError("Reel plan sequence identities must match.");
  }
  const canonicalSources = canonicalizeSources(sources);
  const canonicalShots = canonicalizeShots(shots);
  return {
    schema_version: "1.0",
    job_id,
    plan_id,
    sources: clone(canonicalSources),
    shots: clone(canonicalShots),
    story: clone(story),
    ranking: clone(ranking),
    sequence: clone(sequence),
    timing: clone(timing),
    text_audio: clone(text_audio)
  };
}

export function attachStyleJudge(reelPlan, styleJudgeResult) {
  if (styleJudgeResult?.style_judge_status !== "pending" && styleJudgeResult?.sequence_id !== reelPlan?.sequence?.sequence_id) {
    throw new TypeError("Non-pending style judge output must match the reel plan sequence.");
  }
  return { ...reelPlan, style_judge: clone(styleJudgeResult) };
}

function shotKey(shot) {
  if (typeof shot?.shot_id !== "string" || typeof shot?.source_id !== "string") {
    throw new TypeError("Shot enrichment requires shot_id and source_id.");
  }
  return `${shot.shot_id}\u0000${shot.source_id}`;
}

function enrichmentKey(index) {
  return SHOT_ENRICHMENT_KEYS[index] || `enrichment_${index + 1}`;
}

function clone(value) {
  return value === undefined ? undefined : structuredClone(value);
}
