const QN_MUSIC_PLATFORMS = ["instagram", "facebook", "tiktok", "youtube"];

// Only tracks with explicit compatible rights metadata are eligible for automatic selection.
export const QN_MUSIC_LIBRARY = [
  {
    track_id: "qn_warm_acoustic",
    source_path: "styles/music/warm-acoustic.mp3",
    labels: ["warm", "acoustic", "reflective", "organic", "rural", "instrumental"],
    license: {
      license_type: "commercial_cross_platform",
      rights_status: "verified",
      platforms: [...QN_MUSIC_PLATFORMS]
    }
  },
  {
    track_id: "qn_sentimental_acoustic_cinematic_folk",
    source_path: "styles/music/sentimental-acoustic-cinematic-folk.mp3",
    labels: ["sentimental", "acoustic", "cinematic", "folk", "reflective", "warm"],
    license: {
      license_type: "commercial_cross_platform",
      rights_status: "verified",
      platforms: [...QN_MUSIC_PLATFORMS]
    }
  },
  {
    track_id: "qn_acoustic_folk_nature_background",
    source_path: "styles/music/acoustic-folk-nature-background.mp3",
    labels: ["acoustic", "folk", "nature", "calm", "organic", "rural", "instrumental"],
    license: {
      license_type: "commercial_cross_platform",
      rights_status: "verified",
      platforms: [...QN_MUSIC_PLATFORMS]
    }
  },
  {
    track_id: "qn_dreamy_travel_vlog_gentle_wind",
    source_path: "styles/music/dreamy-travel-vlog-gentle-wind.mp3",
    labels: ["dreamy", "travel", "gentle", "wind", "calm", "atmospheric", "instrumental"],
    license: {
      license_type: "commercial_cross_platform",
      rights_status: "verified",
      platforms: [...QN_MUSIC_PLATFORMS]
    }
  },
  {
  }
];

function normalizePlatform(value) {
  return String(value || "").trim().toLowerCase();
}

function requestedPlatforms(storyManifest) {
  const candidates = storyManifest?.platforms || storyManifest?.platform || storyManifest?.target_platforms;
  const values = Array.isArray(candidates) ? candidates : candidates ? [candidates] : QN_MUSIC_PLATFORMS;
  const normalized = values.map(normalizePlatform).filter(Boolean);
  return [...new Set(normalized.length ? normalized : QN_MUSIC_PLATFORMS)];
}

function contextLabels(storyManifest, visualTagManifest) {
  const text = [storyManifest?.story_goal, storyManifest?.story_theme, storyManifest?.tone]
    .filter(value => typeof value === "string")
    .join(" ")
    .toLowerCase();
  const visualLabels = (visualTagManifest?.shots || []).flatMap(shot => shot.visual_tags || []);
  return new Set((text + " " + visualLabels.join(" ")).split(/[^a-z0-9]+/).filter(Boolean));
}

export function selectMusicTrack({ storyManifest, visualTagManifest, platforms } = {}) {
  const requested = platforms?.length ? platforms.map(normalizePlatform).filter(Boolean) : requestedPlatforms(storyManifest);
  const labels = contextLabels(storyManifest, visualTagManifest);
  const eligible = QN_MUSIC_LIBRARY.filter(track => {
    const license = track.license || {};
    return license.rights_status === "verified"
      && license.license_type
      && requested.every(platform => (license.platforms || []).map(normalizePlatform).includes(platform));
  });
  const ranked = eligible.map(track => {
    const matchedLabels = track.labels.filter(label => labels.has(label));
    return { track, matchedLabels, score: matchedLabels.length };
  }).sort((left, right) => right.score - left.score || left.track.track_id.localeCompare(right.track.track_id));
  const selected = ranked[0];
  if (!selected) {
    return {
      selection_status: "no_selection",
      track_id: null,
      source_path: null,
      selection_reason: "No library track has verified license compatibility for the requested platforms.",
      matched_labels: [],
      license_platform_compatibility: {
        compatible: false,
        requested_platforms: requested,
        license_type: null,
        rights_status: "no_compatible_track"
      }
    };
  }
  return {
    selection_status: "selected",
    track_id: selected.track.track_id,
    source_path: selected.track.source_path,
    selection_reason: selected.matchedLabels.length
      ? "Selected by deterministic story and visual label match."
      : "Selected as the deterministic compatible library fallback.",
    matched_labels: selected.matchedLabels,
    license_platform_compatibility: {
      compatible: true,
      requested_platforms: requested,
      allowed_platforms: selected.track.license.platforms,
      license_type: selected.track.license.license_type,
      rights_status: selected.track.license.rights_status
    }
  };
}
