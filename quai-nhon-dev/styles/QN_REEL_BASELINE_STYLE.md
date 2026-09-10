# QN Reel Baseline Style

Version: 1.1
Purpose: Baseline editing rules for every QN reel before any learned pattern/style profile is applied.

This file is not a trend library and is not meant to imitate one creator. It defines the minimum QN standard so a reel feels intentional, smooth, human, and coherent instead of looking like random clips placed on a timeline.

---

## 0. How the pipeline must use this file

This baseline is an execution constraint, not reference reading. It must be supplied to the planning agents before a reel plan is created.

Use it as follows:

- Step 6 Story Intent: choose a simple story that fits the baseline identity and arc rules.
- Step 7 Shot Ranking: rank shots for story usefulness, visual strength, uniqueness, and continuity potential.
- Step 8 Sequence: build the ordered visual progression using the sequencing and motion-continuity rules here.
- Step 9 Timing: assign durations and transitions using the pacing rules here.
- Step 10 Text / Audio: keep additions minimal and only when supported by real assets/context.
- Step 11 QN Style Judge: evaluate the complete plan against this entire baseline.

The renderer does not invent style. It should execute the canonical `reel_plan` produced by Steps 6–10. Therefore, if this file is not injected into those planning steps, the final render may still look random even if Step 11 later notices the problem.

Later learned pattern files are layered **after** this baseline. A selected pattern may bend soft defaults such as pacing, text density, transition frequency, or hook shape, but may not override source truth, continuity, technical validity, or QN authenticity.

### Rule strength

Interpret language in this file using three levels:

- **MUST / MUST NOT** — hard baseline requirement.
- **SHOULD / SHOULD NOT** — strong default; deviate only for a clear story reason.
- **MAY** — optional choice when it improves the reel.

---

## 1. Core identity

QN reels should feel:

- documentary first, social-media optimized second;
- authentic, local, human, warm, immersive;
- calm but not slow or empty;
- cinematic without looking over-produced;
- visually clean, emotionally grounded, and easy to follow;
- built around real moments, people, place, movement, work, food, sea, river, village life, and small details.

Avoid generic tourism-ad energy. Avoid forcing every reel to feel epic. Let strong footage carry the reel.

---

## 2. Priority order

When rules conflict, use this order:

1. Technical validity and pipeline contracts.
2. Source truth: never invent footage, actions, people, text, sound, or events that do not exist.
3. Story clarity and shot continuity.
4. Visual strength.
5. QN baseline style in this file.
6. Learned pattern/style profile, when one is explicitly selected later.
7. Variety.

A weaker clip should not be used only to increase variety.

---

## 3. Reel structure

Every reel should have a simple visual arc, even when there is no narration.

### Opening / Hook

- First 0–2 seconds must contain one of the strongest or most intriguing shots available.
- Prefer visible motion, human action, unusual detail, strong environment, or a clear visual question.
- Do not begin with a weak establishing shot unless it is visually exceptional.
- Avoid title-card openings unless the concept specifically requires one.

### Development

- Establish where we are or what is happening quickly.
- Progress visually instead of showing interchangeable shots.
- Prefer sequences such as:
  - wide → medium → detail;
  - preparation → action → result;
  - arrival → experience → payoff;
  - person → hands/action → environment;
  - calm → movement → calm;
  - curiosity → reveal → emotional hold.

### Ending

- End on a satisfying visual beat, reveal, human moment, destination, completed action, or atmospheric hold.
- Do not end simply because the target duration was reached.
- Avoid cutting off motion awkwardly at the final frame.

---

## 4. Shot selection

Use the strongest footage first.

Prefer shots with:

- clear subject;
- readable action;
- good composition;
- useful motion;
- emotional or local character;
- strong light/color/texture;
- a clear role in the story.

Reject or heavily penalize shots that are:

- visibly blurry without narrative value;
- accidental camera movement;
- badly exposed;
- blocked or confusing;
- near-duplicates of a stronger shot;
- repetitive without progression;
- visually weak and unnecessary for story continuity.

Do not force every source file into the reel.

---

## 5. Sequencing rules

The sequence must feel visually connected.

Prefer:

- continuity of action;
- continuity of subject;
- continuity of screen direction;
- motion matching between adjacent shots;
- scale progression: wide → medium → close/detail;
- visual contrast when deliberately changing scene or energy;
- a reason for every cut.

Avoid:

- random alternation between unrelated shots;
- repeated wide → wide → wide when closer material exists;
- repeated nearly identical angles;
- sudden direction reversals unless the story requires them;
- cutting away from an action immediately before its payoff;
- placing a weak shot between two strong shots only for variety.

When two adjacent shots are both valid, prefer the pair whose motion, subject, framing, light, or action creates the smoother visual handoff.

---

## 6. Timing and pacing

Default pacing should feel deliberate, not frantic.

General timing guidance:

- Avoid clips shorter than about 0.7 sec unless a fast accent is clearly justified.
- Typical action/detail shot: about 1.2–2.5 sec.
- Typical medium/wide story shot: about 1.8–3.5 sec.
- Strong emotional, scenic, or payoff shot may hold about 3–5 sec when the image earns the time.
- Do not use identical duration for every shot.
- Cut on action when possible.
- Let visible motion complete enough to feel intentional.
- If a shot becomes visually empty, leave it earlier.

Pacing should follow the footage. Do not make a reel fast only because short-form video is fast.

---

## 7. Transitions

Default transition: `cut`.

Use `crossfade` only when it improves meaning or flow, such as:

- time shift;
- location shift;
- emotional transition;
- quiet atmospheric bridge;
- two visually compatible scenic shots.

Crossfade guidance:

- normally about 0.20–0.45 sec;
- rarely exceed 0.60 sec;
- do not crossfade every shot;
- never use crossfade to hide weak sequencing.

Do not use flashy transitions, zoom-spin effects, fake camera moves, wipes, or trend effects unless a later selected style profile explicitly calls for them and the footage supports them.

---

## 8. Motion continuity

Before placing two shots together, consider:

- where the subject is moving;
- where the viewer's eye is positioned;
- whether camera motion continues naturally;
- whether the next shot starts with compatible energy;
- whether action can be matched across the cut.

Prefer cuts where the viewer's eye does not need to search for the subject again.

If two shots conflict badly in direction or movement, insert a neutral/detail/establishing shot only if that shot is genuinely useful.

---

## 9. Text

Text is optional, not mandatory.

Default rules:

- Use as little text as possible.
- Prefer 0–2 important text cues for a short reel.
- Avoid more than 3 cues unless the reel concept is explicitly informational.
- Each cue should normally be short enough to understand in one glance.
- Use text to add context, curiosity, place, meaning, or a useful detail—not to describe what is already obvious on screen.
- Avoid generic phrases such as “Amazing place”, “Hidden gem”, “You need to visit”, or similar tourism clichés unless there is a specific reason.
- Do not invent facts.
- Do not cover the main subject.

If no text improves the reel, return no text cues.

---

## 10. Audio

Audio should support the reel, not rescue it.

Rules:

- Never invent an audio asset that does not exist.
- If usable natural/source audio exists later in the pipeline, preserve valuable local sound when possible: water, market sounds, engines, cooking, tools, voices, footsteps, wind, boats, animals, etc.
- Music should not overpower meaningful natural sound.
- Do not use dramatic music automatically for every reel.
- If no valid audio asset is available, the pipeline may render without invented audio.

Future learned music/pacing profiles may refine this section.

---

## 11. QN visual rhythm

A baseline QN reel should normally combine different visual scales instead of staying at one distance.

Useful rhythm example:

1. strong hook/action;
2. environment or orientation;
3. human/action detail;
4. closer texture/detail;
5. movement/progression;
6. payoff or emotional/scenic hold.

This is a guide, not a fixed six-shot template.

The goal is visual breathing: energy → information → detail → movement → payoff.

---

## 12. Platform-safe baseline

Unless a job specifies otherwise:

- Aspect ratio: 9:16 vertical.
- Final: 1080×1920.
- Frame rate: 30 fps.
- Keep important subjects and text away from extreme top/bottom UI zones.
- Avoid tiny text.
- Avoid relying on platform-specific effects for the story to make sense.

Platform-specific variants for Instagram, TikTok, Facebook, and Threads should be handled by later publishing/style profiles, not by breaking the QN baseline.

---

## 13. Step-specific guidance

### Step 6 — Story Intent

Create the simplest strong story supported by the available footage.

- Do not invent missing moments.
- Identify opening, development, and ending.
- Prefer one clear theme over several weak themes.
- Story should be understandable visually even without text.

### Step 7 — Shot Ranking

Rank for the reel being made, not for abstract beauty alone.

Highest ranking should favor:

1. story relevance;
2. visual strength;
3. useful action/motion;
4. uniqueness;
5. continuity potential.

A beautiful shot with no role in the story can rank below a slightly weaker shot that completes an important action.

### Step 8 — Sequence

Build a progression, not a playlist.

- Strong opening.
- Logical visual development.
- Avoid duplicate visual beats.
- Use wide/medium/detail relationships.
- Prefer action continuity and eye-trace continuity.
- Save an appropriate payoff/hold for the ending.

### Step 9 — Timing

Timing must reflect the content of each shot.

- Do not assign equal durations mechanically.
- Action cuts may be faster.
- Scenic/emotional shots may breathe.
- Default to cuts.
- Crossfade only for justified scene/time/emotional bridges.
- Final target duration must remain exact according to the pipeline contract.

### Step 10 — Text / Audio

Text and audio are optional enhancements.

- Prefer minimal text.
- Never invent facts or media assets.
- Do not add text merely because the schema supports text cues.
- If audio assets are unavailable, do not fabricate references.

### Step 11 — QN Style Judge

Judge the plan against this baseline.

Penalize heavily for:

- weak opening;
- random sequencing;
- unnecessary repeated shots;
- frantic or mechanical pacing;
- excessive transitions;
- generic tourism-ad tone;
- unnecessary text;
- invented information;
- a weak ending;
- ignoring stronger footage without a story reason.

A passing reel should feel intentional even before any learned pattern profile is applied.

---

## 14. Baseline style score

For Step 11, evaluate these areas conceptually:

- Hook strength: 0–20
- Story/progression: 0–20
- Shot selection quality: 0–20
- Sequence/continuity: 0–15
- Pacing/timing: 0–15
- QN authenticity/restraint: 0–10

Suggested baseline pass threshold: 75/100.

A high score does not require flashy editing. Smoothness, clarity, authenticity, and strong footage are more important.

---

## 15. Anti-patterns

Do not intentionally produce:

- random montage with no progression;
- every shot cut to the same duration;
- constant crossfades;
- excessive speed-ramping;
- fake cinematic effects over weak footage;
- generic motivational/tourism copy;
- text on every shot;
- repeated clips for filler;
- forced use of all available sources;
- trend imitation that weakens QN identity;
- a reel that only makes sense because an explanation says what it is supposed to mean.

---

## 16. Future learned pattern system

This file is the permanent baseline, not the learned pattern library.

Later, approved reference reels can be analyzed into separate pattern files, for example:

- `patterns/documentary-human.md`
- `patterns/fast-hook-slow-payoff.md`
- `patterns/action-match-cut.md`
- `patterns/quiet-atmospheric.md`
- `patterns/food-process.md`

A learned pattern may adjust:

- hook structure;
- shot-duration distribution;
- sequence rhythm;
- transition frequency;
- text density;
- audio rhythm;
- visual motif;
- ending pattern.

A learned pattern should not override:

- source truth;
- identity/lineage contracts;
- technical validity;
- QN authenticity;
- the rule that weak footage is not forced into the reel.

---

## 17. Final principle

The reel should look like someone intentionally edited a real QN moment—not like an algorithm randomly assembled clips.

When uncertain, choose:

**stronger footage + simpler story + cleaner cuts + more natural pacing.**

---

## 18. Default smoothness profile

Until a learned pattern is explicitly selected, use this as the default editing behavior. These are soft ranges, not frame-accurate rules.

### Shot-role timing

- Hook / immediate action: usually **0.8–1.8 sec**.
- Active human/action shot: usually **1.0–2.3 sec**.
- Detail / texture / insert: usually **0.8–1.8 sec**.
- Medium context shot: usually **1.4–2.8 sec**.
- Wide establishing / scenic shot: usually **1.8–3.5 sec**.
- Payoff / emotional ending: usually **2.0–4.5 sec** when the image earns the hold.

Do not force a shot into a range if the visible action requires more or less time. The important rule is that the viewer sees enough of the action to understand it without the reel feeling mechanically slow.

### Default cut rhythm

For a normal 10–20 second QN reel:

- Prefer mostly straight cuts.
- Normally use **0–2 crossfades** total.
- Avoid several adjacent crossfades.
- Do not use a crossfade where a clean cut on motion works better.
- Avoid long runs of equal-length shots; rhythm should vary with content.

### Adjacent-shot handoff check

Before accepting each cut, Step 8/9 should consider whether at least one strong continuity bridge exists:

- same subject or action;
- motion continues naturally;
- viewer eye position is compatible;
- shot scale progresses usefully;
- environment/location relationship is understandable;
- visual contrast is intentional rather than accidental.

If no continuity bridge exists, the cut needs a clear story reason.

### Opening quality gate

The first shot should normally be among the strongest available shots for this story. A weaker shot may open only when it creates necessary context, curiosity, or setup that makes the next beat stronger.

### Ending quality gate

The final shot must feel chosen. Do not finish on leftover footage, mid-motion truncation, or a visually weaker duplicate when a stronger payoff exists.

---

## 19. Baseline plan checklist

Before Step 11 passes a plan, confirm all of the following conceptually:

- The first 2 seconds contain a real hook or strong visual reason to continue.
- The reel has one understandable visual idea rather than unrelated highlights.
- The sequence progresses instead of repeating the same visual beat.
- Stronger footage was not ignored without a story/continuity reason.
- Adjacent cuts are understandable and visually intentional.
- Shot durations vary according to content.
- Motion is not cut off awkwardly unless deliberately used as an accent.
- Crossfades are sparse and justified.
- Text is minimal and adds information/meaning rather than describing the obvious.
- Missing audio assets do not cause invented audio references.
- The final shot provides a payoff, resolution, human beat, or intentional atmospheric hold.
- The reel would still feel coherent if the viewer knew nothing about the planning JSON.

If several of these fail, Step 11 should return `revise` even when the reel is technically valid.

---

## 20. Relationship to learned patterns

The baseline is permanent. Learned pattern files are modular overlays generated from approved reference reels.

Each learned pattern should describe measurable editing behavior rather than creator identity, for example:

- hook type and first-shot duration;
- shot-role sequence;
- median and range of shot durations;
- cut vs crossfade frequency;
- match-cut / motion-continuity behavior;
- use of wide, medium, close and detail shots;
- text timing and density;
- audio/natural-sound behavior;
- energy curve;
- ending structure.

Do not store a pattern as “copy creator X.” Extract the reusable editing grammar and save that grammar as a QN-compatible pattern profile.

When no learned pattern is selected, this baseline alone defines the edit.

