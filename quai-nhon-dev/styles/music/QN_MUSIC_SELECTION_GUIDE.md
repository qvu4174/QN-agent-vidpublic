# QN Music Selection Guide
Version: 1
Scope: Shared music library for IG/FB/TikTok/YouTube.

## Core rule

Music belongs to the shared QN library, not to a platform or style.

`style_affinity` is a preference signal only. It must never prevent a track from crossing between IGFB and TTYT when the story, footage, pacing, or desired contrast makes that track a better fit.

The Music Selector should choose based on the reel first and platform second.

---

## Selection inputs

Before ranking music, derive a desired music profile from:

- platform
- active QN style
- story theme
- emotional tone
- scenic subtype
- expected reel duration
- expected cut density
- voiceover present/not present
- footage motion level
- desired ending feeling
- recently used tracks

Do not select by filename alone.

---

## Hard gates

A track must not be automatically published unless its rights state permits the target platforms.

For the current library, source licenses have been identified, but cross-platform automated publishing remains a separate rights-verification step.

Content-ID registration is NOT the same as “cannot use.” It means the system must preserve license/source evidence because automated claims can occur.

---

## Recommended scoring

Start with a weighted score, then allow human override.

```text
story / emotional fit        30%
style subtype fit            20%
energy + cut-density fit     15%
footage motion fit           10%
voiceover compatibility      10%
platform affinity             5%
recent-use diversity          10%
```

Do not make `platform_affinity` dominant.

The same track should be allowed to perform differently across platforms.

---

## Diversity rule

Avoid creating a channel where every emotional reel uses the same piano track and every scenic reel uses the same rhythmic track.

Use a soft `recent_usage_penalty`.

Suggested initial behavior:

- strongly penalize the exact track if used in the immediately previous reel on that platform
- moderately penalize if used within the previous 3 reels
- remove the penalty when the story-to-track match is unusually strong
- never reject a track solely because it belongs to another platform's usual style

Weekly Learning can later replace these heuristics with performance data.

---

# Current library roles

## 1. `atlasaudio-nostalgic-511878`

### Primary personality
**Memory / home / sentimental warmth**

This is currently the clearest default candidate for `IGFB_RURAL_MEMORY`.

Use when the reel is about:

- childhood
- parents
- leaving or returning home
- ordinary things remembered later
- absence without extreme tragedy
- old roads, houses, river, family-space imagery
- emotional rural observation

It can also work for TTYT Scenic Stillness when the image itself feels like a memory.

Avoid using it as the automatic answer to every emotional reel. That would make IG/FB predictable very quickly.

---

## 2. `paulyudin-piano-piano-music-508963`

### Primary personality
**Deep emotional / cinematic piano**

Stronger emotional weight than the general calm tracks.

Use when the story deserves a larger emotional payoff:

- parents aging
- time passing
- loss
- absence
- old home
- returning after a long time
- emotionally heavy memory

Treat as a high-emotion tool.

Do not use for ordinary peaceful scenery merely because the footage is pretty. Too much emotional piano can make QN feel manufactured or melodramatic.

---

## 3. `mixkit-relaxation-07-760`

### Primary personality
**Documentary reflection**

Potentially the most versatile crossover track in the current library.

Good for:

- rural work
- fisherman activity
- quiet market preparation
- ordinary village life
- river / coconut / water
- IGFB memory without strong sadness
- TTYT Scenic Stillness
- TTYT Scenic Guide
- faceless narration

When uncertain between “emotional” and “scenic documentary,” test this track early.

---

## 4. `atlasaudio-calm-piano-590156`

### Primary personality
**Gentle / hopeful / peaceful**

Use for softer positive emotion rather than sadness.

Good for:

- morning light
- peaceful homecoming
- calm river
- simple village beauty
- hopeful Rural Memory
- Scenic Stillness
- quiet guide / location content

This is useful to prevent `RURAL_MEMORY` from becoming synonymous with melancholy.

---

## 5. `mixkit-finding-myself-993`

### Primary personality
**Spacious / dreamy / atmospheric**

Best for scenery that needs space.

Good for:

- fog
- water
- sunrise
- wide drone geography
- empty road
- slow moving kayak / boat
- contemplative no-face footage
- Scenic Stillness
- narration where music should stay behind the voice

This track can give IGFB a more modern atmospheric flavor when we want to move away from piano nostalgia.

---

## 6. `mixkit-zanarkand-forest-169`

### Primary personality
**Modern scenic momentum**

This is currently the strongest natural candidate for `TTYT_SCENIC_WONDER`.

Use for:

- multiple locations
- visual contrast
- boat / road / moving camera
- drone reveal
- faster scenic edits
- scenery with continuous motion
- discovery-first reels

Because the source labels include bass and drums, it should be tested first when the edit needs clear rhythmic structure.

Do not default to this track for grief, parents, or deep Rural Memory.

---

## 7. `mixkit-charlotte-586`

### Primary personality
**Soothing / warm / distinctive ambient**

Potential use:

- sunset
- still water
- warm evening
- slow landscape
- reflective experimental reel

The source explicitly categorizes the track with an Arabic theme. Therefore treat it as a flavor track, not a QN default.

If its melodic identity makes the visual feel culturally disconnected from Quài Nhơn, rank it down even when its energy technically matches.

This is a good example of why labels must include cultural-fit judgment, not only BPM and mood.

---

# Style-specific selection

## IGFB — QN Rural Memory

Start by identifying the emotional class.

### Deep memory / loss / parents
Prioritize:

1. `paulyudin-piano-piano-music-508963`
2. `atlasaudio-nostalgic-511878`
3. `mixkit-relaxation-07-760`

### Warm memory / homecoming / childhood
Prioritize:

1. `atlasaudio-nostalgic-511878`
2. `atlasaudio-calm-piano-590156`
3. `mixkit-relaxation-07-760`

### Observational rural life
Prioritize:

1. `mixkit-relaxation-07-760`
2. `mixkit-finding-myself-993`
3. `atlasaudio-calm-piano-590156`

### Atmospheric / modern variation
Prioritize:

1. `mixkit-finding-myself-993`
2. `mixkit-charlotte-586`
3. `mixkit-relaxation-07-760`

This variation is intentional. IGFB should not become “sad piano = QN.”

---

## TTYT — QN Scenic Stillness

For one strong shot / slow scenic observation:

1. `mixkit-finding-myself-993`
2. `mixkit-relaxation-07-760`
3. `atlasaudio-calm-piano-590156`
4. `mixkit-charlotte-586`

Use Nostalgic when the scenic frame carries memory rather than pure visual wonder.

---

## TTYT — QN Scenic Wonder

For a multi-shot music-driven montage:

1. `mixkit-zanarkand-forest-169`

The current library is weak in this category after Zanarkand Forest.

Do NOT force a slow piano track into a fast scenic montage merely because no better track exists.

If the story requires high scenic momentum and Zanarkand is a poor fit or was just used, return:

```text
music_match_confidence = low
recommend_library_expansion = true
```

This is better than making a bad automatic selection.

We should add more rhythmic/uplifting commercial-safe tracks later.

---

## TTYT — QN Scenic Guide

For scenic footage with useful information or faceless narration:

1. `mixkit-relaxation-07-760`
2. `mixkit-finding-myself-993`
3. `atlasaudio-calm-piano-590156`
4. `mixkit-zanarkand-forest-169` when the guide is more energetic

Narration readability outranks musical drama.

---

# Voiceover rule

When voiceover exists:

Prefer tracks labeled:

- `voiceover_fit = high`
- low or medium emotional weight
- low arrangement density

Start with:

- Finding Myself
- Relaxation 07
- Calm Piano

Use the deeper piano tracks only when the narration has enough space and the music does not compete emotionally.

---

# Natural sound rule

QN should preserve natural ambience when it adds place identity.

Examples:

- boat engine
- waves
- market sound
- rain
- birds
- Cub motorcycle
- fishing equipment
- cooking

The Music Selector should be allowed to choose a lower-density track when strong natural sound is available.

Music should not erase Quài Nhơn.

---

# Selector output

The selector should return a ranked result rather than only a filename.

Example:

```json
{
  "selected_audio_id": "mixkit-relaxation-07-760",
  "confidence": 0.88,
  "reason_codes": [
    "documentary_story_fit",
    "low_medium_energy",
    "voiceover_safe",
    "scenic_guide_affinity"
  ],
  "alternatives": [
    "mixkit-finding-myself-993",
    "atlasaudio-calm-piano-590156"
  ]
}
```

The UI can automatically accept the top result while still allowing manual override.

---

# Audio-analysis integration

The current semantic catalog is intentionally separate from measured audio features.

Later, the Mac Audio Analyzer should fill:

```text
measured_duration_sec
bpm
beat_confidence
strong_onsets
energy_sections
loudness
```

The Music Selector chooses the *kind* of track.

Step 9 Timing uses the measured audio structure to decide *where to cut*.

Do not merge these two responsibilities.

---

# Current library gap

The current seven tracks are strongest in:

- nostalgia
- calm
- reflection
- atmospheric scenic footage
- documentary

The largest missing category is:

> **rhythmic / uplifting / travel momentum for Scenic Wonder**

`Zanarkand Forest` currently carries too much responsibility there.

Before scaling TTYT output, add 2–4 more tracks with:

- medium energy
- clear beat structure
- strong but non-aggressive musical onsets
- travel / discovery / wonder character
- little or no vocal content

---

# Final principle

> **Choose music for what the reel should make the viewer feel and how the footage needs to move — not because a platform “owns” that track.**

Platform/style affinity guides the first search.
Story + footage + audio structure decide the winner.
