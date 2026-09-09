import { createShotDetector } from "./shot-detector.js";
import { createQualityAgent } from "./quality-agent.js";
import { createVisualTagAgent } from "./visual-tag-agent.js";
import { createDuplicateAgent } from "./duplicate-agent.js";
import { createStoryAgent } from "./story-agent.js";
import { createShotRankingAgent } from "./shot-ranking-agent.js";
import { createSequenceAgent } from "./sequence-agent.js";
import { createTimingAgent } from "./timing-agent.js";
import { createTextAudioAgent } from "./text-audio-agent.js";
import { createQNStyleJudge } from "./qn-style-judge.js";
import { createRenderVerificationAgent } from "./render-verification-agent.js";
import {
  assembleReelPlan,
  attachStyleJudge,
  buildRankingInput,
  buildSequenceInput,
  buildStoryInput,
  buildTextAudioInput,
  buildTimingInputs,
  canonicalizeShots,
  canonicalizeSources,
  mergeShotEnrichment
} from "./pipeline-assembler.js";

export function createPipelineRunner({
  detect,
  qualityAnalyze,
  visualTagAnalyze,
  storyAnalyze,
  rankingAnalyze,
  sequenceAnalyze,
  timingAnalyze,
  textAudioAnalyze,
  styleJudgeAnalyze,
  renderVerificationAnalyze
} = {}) {
  const shotDetector = createShotDetector({ detect });
  const qualityAgent = createQualityAgent({ analyze: qualityAnalyze });
  const visualTagAgent = createVisualTagAgent({ analyze: visualTagAnalyze });
  const duplicateAgent = createDuplicateAgent();
  const storyAgent = createStoryAgent({ analyze: storyAnalyze });
  const rankingAgent = createShotRankingAgent({ analyze: rankingAnalyze });
  const sequenceAgent = createSequenceAgent({ analyze: sequenceAnalyze });
  const timingAgent = createTimingAgent({ analyze: timingAnalyze });
  const textAudioAgent = createTextAudioAgent({ analyze: textAudioAnalyze });
  const styleJudge = createQNStyleJudge({ analyze: styleJudgeAnalyze });
  const renderVerificationAgent = createRenderVerificationAgent({ analyze: renderVerificationAnalyze });
  async function runStep2(sourceManifest) {
    const sources = canonicalizeSources(sourceManifest);
    sources.forEach((source, index) => {
      if (!source.local_ready || typeof source.local_path !== "string" || !source.local_path.trim()) {
        throw new Error(`Step 2 source at index ${index} is not locally verified.`);
      }
    });
    const step2ShotArrays = await Promise.all(sources.map(source => shotDetector.detectShots(source.local_path, source.source_id)));
    return {
      sources,
      shot_manifest: {
        status: "completed",
        input_step: "01_source_intake",
        input_job_id: sourceManifest?.job_id ?? null,
        shots: canonicalizeShots(step2ShotArrays.flat())
      }
    };
  }

  return {
    runStep2,
    async run({ sourceManifest, job_id, plan_id, render_artifact }) {
      const { sources, shot_manifest: shotManifest } = await runStep2(sourceManifest);
      const shots = shotManifest.shots;

      const [quality, visualTag, duplicate] = await Promise.all([
        qualityAgent.evaluate(shotManifest),
        visualTagAgent.evaluate(shotManifest),
        Promise.resolve(duplicateAgent.evaluate(shotManifest))
      ]);
      const enrichedShots = mergeShotEnrichment(shots, quality, visualTag, duplicate);

      const story = await storyAgent.evaluate(buildStoryInput(sources, enrichedShots));
      const ranking = await rankingAgent.evaluate(buildRankingInput(story, sources, enrichedShots));
      const sequence = await sequenceAgent.evaluate(buildSequenceInput(ranking));
      const timingInputs = buildTimingInputs(sequence, shots);
      const timing = await timingAgent.evaluate(timingInputs.sequenceManifest, timingInputs.shotManifest);
      const textAudio = await textAudioAgent.evaluate(buildTextAudioInput(timing));
      const reelPlan = assembleReelPlan({
        job_id,
        plan_id,
        sources,
        shots: enrichedShots,
        story,
        ranking,
        sequence,
        timing,
        text_audio: textAudio
      });
      const styleJudgeResult = await styleJudge.evaluate({
        ...reelPlan,
        sequence_id: reelPlan.sequence.sequence_id,
        shot_timings: reelPlan.timing.shot_timings,
        text_cues: reelPlan.text_audio.text_cues,
        audio_cues: reelPlan.text_audio.audio_cues
      });
      const judgedPlan = attachStyleJudge(reelPlan, styleJudgeResult);
      const renderVerification = await renderVerificationAgent.evaluate({
        reel_plan: judgedPlan,
        plan_id: judgedPlan.plan_id,
        sequence_id: judgedPlan.sequence.sequence_id,
        render_artifact
      });

      return {
        sources,
        shots: enrichedShots,
        quality,
        visual_tag: visualTag,
        duplicate,
        story,
        ranking,
        sequence,
        timing,
        text_audio: textAudio,
        reel_plan: judgedPlan,
        render_verification: renderVerification
      };
    }
  };
}
