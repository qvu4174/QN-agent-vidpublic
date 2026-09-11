import { DIAGNOSTICS_WORLD_ART } from './diagnostics-world-art.js';
import { BAC_QUAI_CUTOUT } from './bac-quai-cutout-art.js';

// Coordinates belong to the illustration, not to the runtime or a repository.
export const DIAGNOSTICS_STATIONS = [
  ['Source Intake',170,175,'Arrival table','⇩','carrier','#a75e45'],['Shot Detection',425,195,'Cutting shed','✂','editor','#55756f'],
  ['Quality',675,215,'Inspection table','◇','inspector','#657b47'],['Visual Tags',930,240,'Tagging table','◆','tagger','#936d47'],
  ['Duplicate',1155,263,'Sorting yard','≋','sorter','#6e6285'],['Story',1200,448,'Story table','✎','writer','#a26056'],
  ['Shot Ranking',910,470,'Selection house','★','curator','#536f81'],['Sequence',580,457,'Assembly table','▤','assembler','#7f6943'],
  ['Timing',285,400,'Timing table','◷','timekeeper','#667e57'],['Text + Audio',295,628,'Sound table','♪','sound','#8b5e67'],
  ['Style Judge',615,674,'Style atelier','✦','stylist','#735d8c'],['Render Verification',910,692,'Projection table','▶','projectionist','#4e7482'],
  ['Human Review',1250,710,'Screening courtyard','◉','reviewer','#a65d46'],['Publish',1220,947,'Departure pier','↗','publisher','#497568'],
  ['Performance',905,944,'Observation deck','∿','observer','#866849'],['Pattern Learning',625,918,'Learning house','⟲','teacher','#5d738c'],
  ['Style Memory',340,892,'Memory garden','◎','archivist','#7b684d']
];

export const DIAGNOSTICS_WORLD_HTML = `
<header class="dw-heading"><div><p>QN Reel World / Diagnostics</p><h1>Quài Nhơn</h1></div><div class="dw-live"><span id="dw-response-dot"></span><div><strong id="dw-world-status">Waiting for a job</strong><span id="dw-world-context">The world is ready. No runtime state has been reported.</span></div></div></header>
<div class="dw-workspace">
  <section class="dw-map-column" aria-label="Pipeline world">
    <div class="dw-map-tools"><span>12-stage active route</span><div><button id="dw-current" disabled>Locate current</button><button id="dw-zoom-out" aria-label="Zoom out">−</button><output id="dw-zoom-level" aria-label="Map zoom">100%</output><button id="dw-zoom-in" aria-label="Zoom in">+</button></div></div>
    <div class="dw-viewport" id="dw-viewport" tabindex="0" aria-label="Quài Nhơn pipeline map. Scroll to explore; use Tab to select a station.">
      <div class="dw-map" id="dw-map"><img class="dw-terrain" src="${DIAGNOSTICS_WORLD_ART}" width="1536" height="1024" alt="An illustrated Quài Nhơn pipeline world with twelve distinct coastal workshops connected by winding paths." /><svg id="dw-paths" class="dw-paths" viewBox="0 0 1536 1024" aria-hidden="true"></svg><div id="dw-stations"></div><div id="dw-agents" aria-hidden="true"></div><div id="dw-ready-review" class="dw-ready-review" data-state="pending"><span>✓</span><div><small>Active route ends here</small><strong>Ready to Review</strong></div></div><span class="dw-compass" aria-hidden="true">N<br>↑</span></div>
    </div>
    <div class="dw-legend" aria-label="Station status legend"><span data-state="completed">✓ Complete</span><span data-state="active">● Working</span><span data-state="paused">Ⅱ Checkpoint</span><span data-state="pending">◷ Waiting</span><span data-state="failed">! Failed</span><span data-state="unknown">· No report</span></div>
    <p class="dw-map-note">The active production route ends after render verification. Approval and later systems live outside this path.</p>
    <section class="dw-content-house" id="dw-content-house" data-state="waiting"><div class="dw-content-house-mark" aria-hidden="true">⌂</div><div><span>Separate approved-content module</span><h2>Content House</h2><p>Approved videos can be reviewed, filtered, and manually selected for later learning here. No library data has been reported.</p></div><strong id="dw-content-state">Waiting for approved content</strong></section>
  </section>
  <aside class="dw-drawer" id="dw-drawer" aria-label="Selected station inspector">
    <div class="dw-station-top"><span id="dw-number">01</span><div><p id="dw-place">Arrival dock</p><h2 id="dw-title">Source Intake</h2></div><span id="dw-state" data-state="unknown">No report</span></div>
    <p id="dw-evidence">No stage status reported.</p>
    <div id="dw-progress-readout" hidden><span>Reported job progress</span><strong id="dw-progress-value"></strong><p>Positions the current agent along its outgoing route. Per-stage progress is not separately reported.</p></div>
    <dl class="dw-agent-info"><div><dt>Pipeline agent</dt><dd id="dw-agent"></dd></div><div><dt>Route continues to</dt><dd id="dw-next"></dd></div></dl>
    <div class="dw-detail-tabs" role="tablist" aria-label="Station details"><button role="tab" id="dw-tab-station" aria-controls="dw-panel-station" aria-selected="true" data-dw-tab="station">Station</button><button role="tab" id="dw-tab-lineage" aria-controls="dw-panel-lineage" aria-selected="false" data-dw-tab="lineage">Lineage</button><button role="tab" id="dw-tab-raw" aria-controls="dw-panel-raw" aria-selected="false" data-dw-tab="raw">Raw data</button></div>
    <section id="dw-panel-station" role="tabpanel" aria-labelledby="dw-tab-station"><div id="dw-error" hidden></div><h3>Reported output</h3><p id="dw-output-summary"></p><div id="dw-output-fields"></div><p class="dw-honesty">Neutral stations have no reported status.</p><div class="dw-host"><img src="${BAC_QUAI_CUTOUT}" alt="Bác Quài, your workshop host" /><p><strong>Bác Quài’s workshop</strong><br>Every place holds part of the story.</p></div></section>
    <section id="dw-panel-lineage" role="tabpanel" aria-labelledby="dw-tab-lineage" hidden><h3>Shot → source → local media</h3><p>Job-wide lineage from supplied manifests. Identities and time ranges are shown unchanged.</p><div id="dw-lineage"></div></section>
    <section id="dw-panel-raw" role="tabpanel" aria-labelledby="dw-tab-raw" hidden><h3>Selected station fields</h3><pre id="dw-output-json"></pre><details class="dw-disclosure"><summary>Full job response</summary><div id="dw-job-response"></div></details><details class="dw-disclosure"><summary>Existing pipeline inspector · Mac / logs / manifests</summary><p class="dw-legacy-note">Unmodified underlying inspector. Its default placeholders are not live world status.</p><div id="dw-legacy-inspector"></div></details></section>
    <div class="dw-station-navigation"><button id="dw-previous">← Previous</button><button id="dw-next-station">Next →</button></div>
  </aside>
</div>
<aside id="dw-finish-toast" role="status" aria-live="polite" hidden><button id="dw-finish-close" aria-label="Dismiss completion message">×</button><img src="${BAC_QUAI_CUTOUT}" alt="Bác Quài gives a thumbs-up" /><div><p>Bác Quài says</p><strong>Your reel is ready.</strong><span>The pipeline has finished. Check your reel.</span><button id="dw-finish-review">Check the reel →</button></div></aside>`;

export const DIAGNOSTICS_WORLD_STYLES = `
/* Diagnostics-only. No Production selectors or shared token overrides. */
#operator-diagnostics{max-width:none;padding:24px 28px 30px;color:#e9ecda;background:#132a22}
#operator-diagnostics .dw-heading{display:flex;justify-content:space-between;align-items:center;gap:25px;max-width:1800px;margin:0 auto 22px}
#operator-diagnostics .dw-heading p{margin:0 0 3px;font-size:10px;color:#9ab09b;letter-spacing:.13em;text-transform:uppercase}#operator-diagnostics .dw-heading h1{font:400 39px/1.1 Georgia,serif;margin:0;color:#f3edd7}
#operator-diagnostics .dw-live{display:flex;gap:11px;align-items:center;max-width:490px}#operator-diagnostics .dw-live strong{display:block;font-size:13px;font-weight:500;color:#e3e9d4}#operator-diagnostics .dw-live span:last-child{display:block;font-size:11px;line-height:1.5;margin-top:3px;color:#9fb49d}#operator-diagnostics #dw-response-dot{width:7px;height:7px;flex:0 0 auto;border-radius:50%;background:#82927c}#operator-diagnostics #dw-response-dot[data-state=active]{background:#d9eb87;box-shadow:0 0 0 5px #d9eb8710}#operator-diagnostics #dw-response-dot[data-state=failed]{background:#ffa58c}
#operator-diagnostics .dw-workspace{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:22px;max-width:1800px;margin:auto;align-items:start}#operator-diagnostics .dw-map-column{min-width:0}#operator-diagnostics .dw-map-tools{height:37px;display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}#operator-diagnostics .dw-map-tools>span{font:italic 16px Georgia,serif;color:#bdc9af}#operator-diagnostics .dw-map-tools>div{display:flex;align-items:center;gap:5px}#operator-diagnostics .dw-map-tools output{font:10px ui-monospace,monospace;min-width:37px;text-align:center;color:#bbcaad}
#operator-diagnostics .dw-map-tools button,#operator-diagnostics .dw-station-navigation button{border:1px solid #4c634e;border-radius:5px;color:#e5ebd4;background:#203c2d;padding:6px 10px;cursor:pointer;font-size:11px}#operator-diagnostics .dw-map-tools button:hover,#operator-diagnostics .dw-station-navigation button:hover{background:#36543a}#operator-diagnostics button:disabled{opacity:.42;cursor:not-allowed}#operator-diagnostics button:focus-visible,#operator-diagnostics summary:focus-visible,#operator-diagnostics .dw-viewport:focus-visible{outline:3px solid #f3d282;outline-offset:3px}
#operator-diagnostics .dw-viewport{overflow:auto;max-height:calc(100vh - 278px);min-height:410px;background:#1a473d;border-radius:15px;scrollbar-color:#a4b78b #263f32;scrollbar-width:thin;isolation:isolate;box-shadow:0 12px 35px #071c1840}
#operator-diagnostics .dw-map{position:relative;width:var(--dw-map-width,100%);min-width:900px;aspect-ratio:3 / 2;background:#1c5248}
#operator-diagnostics .dw-terrain{position:absolute;inset:0;width:100%;height:100%;object-fit:fill;pointer-events:none;filter:saturate(.87) brightness(.88)}
#operator-diagnostics .dw-paths{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible}#operator-diagnostics .dw-path{fill:none;stroke:#f4e3a3;stroke-width:3;stroke-dasharray:5 9;opacity:.64;vector-effect:non-scaling-stroke}#operator-diagnostics .dw-path[data-state=completed]{stroke:#d8efb1;stroke-dasharray:none;opacity:.85}#operator-diagnostics .dw-path[data-state=active]{stroke:#f9efb9;stroke-width:4;opacity:1;stroke-dasharray:6 12;animation:dw-flow 5s linear infinite}#operator-diagnostics .dw-path[data-state=failed]{stroke:#ffad8d;opacity:1}
#operator-diagnostics .dw-station{position:absolute;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:99px;max-width:152px;padding:0;border:0;background:transparent;color:#fffae8;cursor:pointer;z-index:2;transition:filter .15s,margin-top .15s}#operator-diagnostics .dw-station:hover{margin-top:-4px;z-index:5;filter:brightness(1.1)}#operator-diagnostics .dw-station[aria-pressed=true]{z-index:4}#operator-diagnostics .dw-station-label{display:flex;align-items:center;gap:6px;padding:5px 9px 5px 5px;background:#112c26ee;border:1px solid #8a9c70;border-radius:30px;box-shadow:0 3px 8px #00170a80;white-space:nowrap;font:500 11px/1.3 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}#operator-diagnostics .dw-station-number{display:grid;place-items:center;width:22px;height:22px;border:1px solid #9fae7f;border-radius:50%;font:12px Georgia,serif;background:#274631;color:#edf0d9}#operator-diagnostics .dw-station-state{display:flex;align-items:center;gap:4px;font:9px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#e3e8d4;background:#17392de8;border-radius:0 0 6px 6px;padding:2px 7px 3px;box-shadow:0 3px 4px #00190d30}#operator-diagnostics .dw-station:after{content:"";width:5px;height:11px;background:#e9e0b9;box-shadow:0 2px 3px #183422}
#operator-diagnostics .dw-station[data-state=active] .dw-station-label{background:#dbe99f;color:#25381e;border-color:#ffffcf;box-shadow:0 0 0 5px #f1edaa28,0 7px 24px #ffda7866}#operator-diagnostics .dw-station[data-state=active] .dw-station-number{background:#36583a;color:#fff9dd}#operator-diagnostics .dw-station[data-state=completed] .dw-station-number{background:#718d56;color:#fff}#operator-diagnostics .dw-station[data-state=completed] .dw-station-label{background:#294731ed;border-color:#b3c78d}#operator-diagnostics .dw-station[data-state=failed] .dw-station-label{background:#743c29;border-color:#ffc499;box-shadow:0 0 0 5px #f4935825}#operator-diagnostics .dw-station[data-state=paused] .dw-station-label{border-color:#e0c184}#operator-diagnostics .dw-station[aria-pressed=true] .dw-station-label{outline:2px solid #fff4c9;outline-offset:4px}#operator-diagnostics .dw-station[data-state=unknown] .dw-station-label{background:#193b32e8;border-color:#8c9b7d}
#operator-diagnostics .dw-compass{position:absolute;right:17px;top:22px;color:#fcf5d1;text-shadow:0 2px 5px #163d36;font:italic 18px/1.2 Georgia,serif;text-align:center}
#operator-diagnostics .dw-legend{display:flex;flex-wrap:wrap;gap:8px 16px;margin:14px 0 0;font-size:10px;color:#a9bea2}#operator-diagnostics .dw-legend [data-state=active]{color:#e5edb8}#operator-diagnostics .dw-legend [data-state=failed]{color:#ffc3a6}#operator-diagnostics .dw-map-note{font-size:10px;color:#91a78f;margin:9px 0 0}
#operator-diagnostics .dw-drawer{background:#eae8d8;color:#283b2c;border-radius:14px;padding:21px 20px 16px;min-width:0;max-height:calc(100vh - 207px);overflow:auto;scrollbar-width:thin;scrollbar-color:#a6af93 #eae8d8}
#operator-diagnostics .dw-station-top{display:grid;grid-template-columns:34px 1fr;gap:0 10px;align-items:center}#operator-diagnostics #dw-number{grid-row:1 / span 2;font:italic 29px Georgia,serif;color:#6d8156}#operator-diagnostics #dw-place{font-size:9px;text-transform:uppercase;letter-spacing:.09em;color:#7b815e;margin:0 0 4px}#operator-diagnostics #dw-title{font:400 25px/1.1 Georgia,serif;color:#243d2e;margin:0}#operator-diagnostics #dw-state{grid-column:2;margin-top:10px;font-size:10px;color:#546644}#operator-diagnostics #dw-state[data-state=failed]{color:#a33e25}#operator-diagnostics #dw-evidence{font-size:11px;color:#6e755f;line-height:1.6;margin:16px 0}
#operator-diagnostics .dw-agent-info{margin:0;padding:14px 0;border-top:1px solid #c9cfb9;border-bottom:1px solid #c9cfb9}#operator-diagnostics .dw-agent-info>div{margin:0 0 9px}#operator-diagnostics .dw-agent-info>div:last-child{margin:0}#operator-diagnostics .dw-agent-info dt{font-size:9px;color:#7b8369}#operator-diagnostics .dw-agent-info dd{font-size:12px;color:#3e5339;margin:3px 0 0}
#operator-diagnostics .dw-detail-tabs{display:flex;gap:17px;border-bottom:1px solid #c7cfb5;margin:17px 0}#operator-diagnostics .dw-detail-tabs button{background:none;border:0;border-bottom:2px solid transparent;border-radius:0;font-size:11px;color:#758263;padding:0 0 9px;cursor:pointer}#operator-diagnostics .dw-detail-tabs button[aria-selected=true]{border-color:#315839;color:#294b30}#operator-diagnostics .dw-drawer h3{font:600 12px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#3b5132;margin:17px 0 9px}#operator-diagnostics .dw-drawer p{font-size:11px;line-height:1.7;color:#6d765f}#operator-diagnostics .dw-output-field{display:block;padding:7px 0;border-bottom:1px solid #d2d7c3;font:10px ui-monospace,monospace;overflow-wrap:anywhere}#operator-diagnostics .dw-honesty{margin-top:20px;color:#808770!important;font-size:10px!important}#operator-diagnostics .dw-host{display:flex;gap:11px;align-items:center;margin-top:24px;border-top:1px solid #cbd0bd;padding-top:17px}#operator-diagnostics .dw-host>span{font:30px Georgia,serif;color:#8b9867}#operator-diagnostics .dw-host p{font:italic 12px/1.6 Georgia,serif;margin:0;color:#6e7a57}#operator-diagnostics .dw-host strong{font-weight:400;color:#3c5735}
#operator-diagnostics #dw-error{padding:10px;color:#953721;background:#f4d8be;border-left:3px solid #b85436;font:11px/1.6 ui-monospace,monospace;white-space:pre-wrap;overflow-wrap:anywhere}#operator-diagnostics .dw-disclosure{margin:15px 0;border-top:1px solid #cbd2bb;padding-top:12px}#operator-diagnostics .dw-disclosure summary{font-size:11px;color:#3d5732;cursor:pointer}#operator-diagnostics .dw-drawer pre{min-height:50px;max-height:300px;background:#dfe3d0;color:#355030;border:0;padding:11px;font:10px/1.6 ui-monospace,monospace;white-space:pre-wrap;overflow-wrap:anywhere;margin-top:10px}#operator-diagnostics .dw-lineage-row{padding:11px 0;border-bottom:1px solid #cbd3b9;font:10px/1.7 ui-monospace,monospace;color:#38502e;overflow-wrap:anywhere}#operator-diagnostics .dw-lineage-row strong{display:block;font-weight:600}#operator-diagnostics .dw-lineage-row span{display:block}
#operator-diagnostics .dw-station-navigation{display:flex;justify-content:space-between;gap:12px;margin-top:23px;padding-top:13px;border-top:1px solid #cbd2bc}#operator-diagnostics .dw-station-navigation button{background:none;border:0;color:#48633c;padding:5px 0}#operator-diagnostics .dw-station-navigation button:hover{background:none;color:#142e1a}
/* Retained technical DOM remains live in this disclosure; nothing is cloned or replaced. */
#operator-diagnostics #dw-legacy-inspector{background:#13261b;color:#c8d7bc;border-radius:6px;margin:12px -8px 0;padding:12px;overflow:auto}#operator-diagnostics #dw-legacy-inspector .app{display:block}#operator-diagnostics #dw-legacy-inspector .main{padding:0}#operator-diagnostics #dw-legacy-inspector .rightbar{display:block;padding:12px 0;border:0}#operator-diagnostics #dw-legacy-inspector .panel,#operator-diagnostics #dw-legacy-inspector .progress-wrap{padding:10px}#operator-diagnostics #dw-legacy-inspector .panel-head{display:block}#operator-diagnostics #dw-legacy-inspector .overview{display:block}#operator-diagnostics #dw-legacy-inspector .steps{grid-template-columns:1fr 1fr}#operator-diagnostics #dw-legacy-inspector .step-name{display:block;font-size:10px}#operator-diagnostics #dw-legacy-inspector h2{font:14px sans-serif;color:#d3dfc5}#operator-diagnostics #dw-legacy-inspector .tabs{gap:10px;padding:0 8px;margin:0 0 10px;flex-wrap:wrap}#operator-diagnostics #dw-legacy-inspector .tab{font-size:10px}#operator-diagnostics #dw-legacy-inspector p{color:#9aaf8b}#operator-diagnostics #dw-legacy-inspector pre{background:#09190f;color:#cadfa8;font-size:10px}#operator-diagnostics #dw-legacy-inspector .group-row{display:none}
/* Calm map pass: one quiet owner at each place; only the reported working owner travels. */
#operator-diagnostics .dw-terrain{filter:saturate(.7) brightness(.9)}
#operator-diagnostics .dw-path{opacity:.22;stroke-width:2;stroke-dasharray:3 10}
#operator-diagnostics .dw-path[data-state=active],#operator-diagnostics .dw-path[data-playback=true]{animation:none;stroke:#faf0af;stroke-width:3;stroke-dasharray:none;opacity:.9}
#operator-diagnostics .dw-path[data-state=completed]{opacity:.45;stroke-width:2}
#operator-diagnostics .dw-station-label{border-radius:6px;background:#183b30eb;border-color:#9aaa7855;box-shadow:0 2px 4px #16301d44;font-size:10px;padding:4px 8px 4px 4px}
#operator-diagnostics .dw-station-number{width:21px;height:21px;font-size:11px;border-color:#99ae6c88}
#operator-diagnostics .dw-station-icon{display:grid;place-items:center;width:17px;height:17px;border-radius:4px;background:#d9cf9a20;color:#f3dda0;font:12px/1 Georgia,serif}
#operator-diagnostics .dw-station-icon{display:none}
#operator-diagnostics .dw-station[data-state=active] .dw-station-icon{background:#385738;color:#fff6c6}
#operator-diagnostics .dw-station-landmark{display:grid;place-items:center;width:29px;height:24px;margin-bottom:-2px;border:1px solid #ead69d99;background:var(--dw-landmark,#815f43);color:#fff3c6;font:15px/1 Georgia,serif;box-shadow:0 3px 5px #152a1b66}
#operator-diagnostics .dw-station[data-role=carrier]{--dw-landmark:#965d45}#operator-diagnostics .dw-station[data-role=carrier] .dw-station-landmark{clip-path:polygon(12% 25%,78% 25%,100% 50%,78% 75%,12% 75%,0 50%)}
#operator-diagnostics .dw-station[data-role=editor]{--dw-landmark:#4f756a}#operator-diagnostics .dw-station[data-role=editor] .dw-station-landmark{border-radius:2px 12px 2px 12px}
#operator-diagnostics .dw-station[data-role=inspector]{--dw-landmark:#6e854d}#operator-diagnostics .dw-station[data-role=inspector] .dw-station-landmark{width:25px;height:25px;transform:rotate(45deg)}#operator-diagnostics .dw-station[data-role=inspector] .dw-station-landmark>span{transform:rotate(-45deg)}
#operator-diagnostics .dw-station[data-role=tagger]{--dw-landmark:#9b6840}#operator-diagnostics .dw-station[data-role=tagger] .dw-station-landmark{clip-path:polygon(0 0,72% 0,100% 50%,72% 100%,0 100%)}
#operator-diagnostics .dw-station[data-role=sorter]{--dw-landmark:#71648c}#operator-diagnostics .dw-station[data-role=sorter] .dw-station-landmark{border-radius:50% 2px 50% 2px}
#operator-diagnostics .dw-station[data-role=writer]{--dw-landmark:#a45f53}#operator-diagnostics .dw-station[data-role=writer] .dw-station-landmark{border-radius:14px 14px 3px 3px}
#operator-diagnostics .dw-station[data-role=curator]{--dw-landmark:#4e7184}#operator-diagnostics .dw-station[data-role=curator] .dw-station-landmark{clip-path:polygon(50% 0,62% 35%,100% 38%,70% 60%,80% 100%,50% 76%,20% 100%,30% 60%,0 38%,38% 35%)}
#operator-diagnostics .dw-station[data-role=assembler]{--dw-landmark:#806943}#operator-diagnostics .dw-station[data-role=assembler] .dw-station-landmark{border-radius:2px;border-width:3px 1px}
#operator-diagnostics .dw-station[data-role=timekeeper]{--dw-landmark:#577d57}#operator-diagnostics .dw-station[data-role=timekeeper] .dw-station-landmark{width:27px;height:27px;border-radius:50%}
#operator-diagnostics .dw-station[data-role=sound]{--dw-landmark:#8b586b}#operator-diagnostics .dw-station[data-role=sound] .dw-station-landmark{border-radius:50% 50% 3px 3px}
#operator-diagnostics .dw-station[data-role=stylist]{--dw-landmark:#76578d}#operator-diagnostics .dw-station[data-role=stylist] .dw-station-landmark{clip-path:polygon(50% 0,62% 30%,94% 14%,76% 45%,100% 62%,65% 67%,70% 100%,50% 76%,30% 100%,35% 67%,0 62%,24% 45%,6% 14%,38% 30%)}
#operator-diagnostics .dw-station[data-role=projectionist]{--dw-landmark:#467687}#operator-diagnostics .dw-station[data-role=projectionist] .dw-station-landmark{width:34px;height:22px;border:3px double #ead69d;border-radius:2px}
#operator-diagnostics .dw-station[data-role=reviewer]{--dw-landmark:#ad6544}#operator-diagnostics .dw-station[data-role=reviewer] .dw-station-landmark{width:30px;height:30px;border-radius:50%;border-style:double;border-width:3px}
#operator-diagnostics .dw-station[data-role=publisher]{--dw-landmark:#39766a}#operator-diagnostics .dw-station[data-role=publisher] .dw-station-landmark{clip-path:polygon(0 30%,65% 30%,65% 0,100% 50%,65% 100%,65% 70%,0 70%)}
#operator-diagnostics .dw-station[data-role=observer]{--dw-landmark:#896a48}#operator-diagnostics .dw-station[data-role=observer] .dw-station-landmark{width:34px;height:19px;border-radius:50%}
#operator-diagnostics .dw-station[data-role=teacher]{--dw-landmark:#53738f}#operator-diagnostics .dw-station[data-role=teacher] .dw-station-landmark{border-radius:50% 50% 3px 3px;border-bottom-width:4px}
#operator-diagnostics .dw-station[data-role=archivist]{--dw-landmark:#786744}#operator-diagnostics .dw-station[data-role=archivist] .dw-station-landmark{width:29px;height:29px;border-radius:50%;box-shadow:inset 0 0 0 4px #e8d69d44,0 3px 5px #152a1b66}
#operator-diagnostics .dw-station-state{display:none}
#operator-diagnostics .dw-station[aria-pressed=true] .dw-station-state,#operator-diagnostics .dw-station[data-current=true] .dw-station-state,#operator-diagnostics .dw-station[data-next=true] .dw-station-state,#operator-diagnostics .dw-station[data-state=failed] .dw-station-state{display:flex}
#operator-diagnostics .dw-station:after{height:7px;width:2px;opacity:.6}
#operator-diagnostics .dw-station[aria-pressed=true] .dw-station-label{outline:1px solid #fff1bf;outline-offset:3px}
#operator-diagnostics .dw-station[data-next=true] .dw-station-label{border-color:#f1dea3;border-style:dashed}
#operator-diagnostics .dw-station[data-state=completed]:before{content:"✓";position:absolute;right:-4px;top:-5px;width:13px;height:13px;line-height:13px;border-radius:50%;background:#c4d49c;color:#27452e;font-size:9px;z-index:2}
#operator-diagnostics .dw-station[data-state=active] .dw-station-label{box-shadow:0 0 0 4px #fff1c526,0 3px 9px #17371f55}
#operator-diagnostics .dw-person{position:absolute;width:18px;height:28px;transform:translate(-50%,-100%);pointer-events:none;z-index:3;opacity:.57;filter:drop-shadow(1px 2px 1px #112a2355);transition:left .8s ease-in-out,top .8s ease-in-out,opacity .3s}
#operator-diagnostics .dw-person-hat{position:absolute;left:-3px;top:0;width:24px;height:10px;background:#dfc58d;clip-path:polygon(50% 0,100% 90%,50% 100%,0 90%);z-index:3}
#operator-diagnostics .dw-person-head{position:absolute;left:6px;top:5px;width:7px;height:7px;border-radius:50%;background:#cfaa7d;z-index:2}
#operator-diagnostics .dw-person-shirt{position:absolute;left:3px;top:10px;width:13px;height:11px;border-radius:4px 4px 2px 2px;background:var(--agent-shirt);z-index:1}
#operator-diagnostics .dw-person-legs{position:absolute;left:6px;top:19px;width:7px;height:8px;border-left:3px solid #273c30;border-right:3px solid #273c30}
#operator-diagnostics .dw-person-tool{position:absolute;right:-8px;top:11px;display:grid;place-items:center;width:11px;height:11px;border:1px solid #705c3c;border-radius:2px;background:#eee0ad;color:#344c38;font:8px/1 Georgia,serif;z-index:4}
#operator-diagnostics .dw-person[data-role=carrier] .dw-person-tool:before{content:"▣"}#operator-diagnostics .dw-person[data-role=editor] .dw-person-tool:before{content:"✂"}#operator-diagnostics .dw-person[data-role=inspector] .dw-person-tool:before{content:"◇"}#operator-diagnostics .dw-person[data-role=tagger] .dw-person-tool:before{content:"◆"}#operator-diagnostics .dw-person[data-role=sorter] .dw-person-tool:before{content:"≋"}#operator-diagnostics .dw-person[data-role=writer] .dw-person-tool:before{content:"✎"}#operator-diagnostics .dw-person[data-role=curator] .dw-person-tool:before{content:"★"}#operator-diagnostics .dw-person[data-role=assembler] .dw-person-tool:before{content:"▤"}#operator-diagnostics .dw-person[data-role=timekeeper] .dw-person-tool:before{content:"◷"}#operator-diagnostics .dw-person[data-role=sound] .dw-person-tool:before{content:"♪"}#operator-diagnostics .dw-person[data-role=stylist] .dw-person-tool:before{content:"✦"}#operator-diagnostics .dw-person[data-role=projectionist] .dw-person-tool:before{content:"▶"}#operator-diagnostics .dw-person[data-role=reviewer] .dw-person-tool:before{content:"◉"}#operator-diagnostics .dw-person[data-role=publisher] .dw-person-tool:before{content:"↗"}#operator-diagnostics .dw-person[data-role=observer] .dw-person-tool:before{content:"∿"}#operator-diagnostics .dw-person[data-role=teacher] .dw-person-tool:before{content:"⟲"}#operator-diagnostics .dw-person[data-role=archivist] .dw-person-tool:before{content:"◎"}
#operator-diagnostics .dw-person[data-role=projectionist] .dw-person-hat,#operator-diagnostics .dw-person[data-role=publisher] .dw-person-hat,#operator-diagnostics .dw-person[data-role=observer] .dw-person-hat{clip-path:polygon(18% 25%,82% 25%,100% 100%,0 100%);background:#c7a96e}
#operator-diagnostics .dw-person[data-role=writer] .dw-person-hat,#operator-diagnostics .dw-person[data-role=teacher] .dw-person-hat,#operator-diagnostics .dw-person[data-role=archivist] .dw-person-hat{width:19px;left:0;border-radius:50% 50% 2px 2px;clip-path:none;background:#ddbd82}
#operator-diagnostics .dw-person[data-state=active]{opacity:1;z-index:6;filter:drop-shadow(0 0 4px #ffe19c);transform:translate(-50%,-100%) scale(1.3)}
#operator-diagnostics .dw-person[data-state=active]:after{content:"";position:absolute;width:10px;height:8px;border-radius:2px;right:-5px;top:13px;background:#e3d2a6;border:1px solid #9c8c5e}
#operator-diagnostics .dw-person[data-handoff=true]{opacity:1;z-index:8;filter:drop-shadow(0 0 5px #fff0ab);transform:translate(-50%,-100%) scale(1.35)}
#operator-diagnostics .dw-person[data-handoff=true]:after{content:"";position:absolute;width:11px;height:9px;border-radius:2px;right:-7px;top:15px;background:#ead7a2;border:1px solid #806d45;box-shadow:0 1px 2px #1a2c1d55}
#operator-diagnostics .dw-person[data-selected=true]{opacity:1}
#operator-diagnostics .dw-person[data-state=completed]{opacity:.38}
#operator-diagnostics .dw-ready-review{position:absolute;left:78%;top:84%;z-index:6;display:flex;align-items:center;gap:8px;padding:8px 11px;border:2px solid #d9cb8e;border-radius:9px;background:#244c39;color:#fff7d8;box-shadow:0 6px 18px #17302066;transform:translate(-50%,-50%)}#operator-diagnostics .dw-ready-review>span{display:grid;place-items:center;width:29px;height:29px;border-radius:50%;background:#dbe99f;color:#294631;font-weight:800}#operator-diagnostics .dw-ready-review small,#operator-diagnostics .dw-ready-review strong{display:block}#operator-diagnostics .dw-ready-review small{font-size:8px;letter-spacing:.08em;text-transform:uppercase;color:#cbd8b7}#operator-diagnostics .dw-ready-review strong{font:600 13px Georgia,serif}#operator-diagnostics .dw-ready-review[data-state=active]{box-shadow:0 0 0 7px #f3e5a844,0 6px 18px #17302066}
#operator-diagnostics .dw-content-house{display:grid;grid-template-columns:52px 1fr auto;align-items:center;gap:14px;margin-top:14px;padding:14px 16px;border:1px solid #75826766;border-radius:11px;background:#1b392d;color:#ecedd8}#operator-diagnostics .dw-content-house-mark{display:grid;place-items:center;width:48px;height:44px;border-radius:4px 4px 10px 10px;background:#a86d43;color:#fff0c6;font:25px Georgia,serif;box-shadow:inset 0 4px #d8b47a}#operator-diagnostics .dw-content-house span{font-size:8px;text-transform:uppercase;letter-spacing:.11em;color:#a7b89b}#operator-diagnostics .dw-content-house h2{margin:2px 0!important;color:#f1ecd7;font:500 18px Georgia,serif!important}#operator-diagnostics .dw-content-house p{margin:0!important;max-width:640px;color:#aebca7!important;font-size:10px!important;line-height:1.45!important}#operator-diagnostics .dw-content-house>strong{max-width:145px;color:#d9dfbd;font-size:10px;text-align:right}#operator-diagnostics .dw-content-house[data-state=approved]{border-color:#d8c77f;background:#244737}#operator-diagnostics .dw-content-house[data-state=approved] .dw-content-house-mark{background:#6f914f}
#operator-diagnostics .dw-host img{width:46px;height:54px;object-fit:cover;object-position:25% center;border-radius:25px 25px 5px 5px}
#dw-finish-toast{position:fixed;right:22px;bottom:22px;z-index:1000;display:grid;grid-template-columns:118px minmax(0,210px);align-items:end;gap:4px;width:min(356px,calc(100vw - 28px));padding:15px 16px 15px 8px;border:1px solid #d8c47d;border-radius:15px;background:#f2ecda;color:#243d2e;box-shadow:0 18px 60px #071b1466}#dw-finish-toast[hidden]{display:none}#dw-finish-toast>img{width:122px;max-height:154px;object-fit:contain;object-position:center bottom;margin:-54px -2px -15px}#dw-finish-toast>div{align-self:center}#dw-finish-toast p{margin:0 0 4px;color:#7c7656;font:italic 11px Georgia,serif}#dw-finish-toast strong{display:block;color:#243d2e;font:23px/1.05 Georgia,serif}#dw-finish-toast span{display:block;margin:7px 0 11px;color:#66705d;font:11px/1.45 sans-serif}#dw-finish-toast #dw-finish-review{border:0;border-radius:6px;background:#315b3d;color:#fffbe5;padding:8px 11px;font:600 11px sans-serif;cursor:pointer}#dw-finish-toast #dw-finish-close{position:absolute;right:8px;top:7px;border:0;background:transparent;color:#6d745f;font:20px/1 sans-serif;cursor:pointer}#dw-finish-toast button:focus-visible{outline:3px solid #d29c4b;outline-offset:2px}
#operator-diagnostics #dw-progress-readout{padding:11px 0;border-top:1px solid #cbd2b9;display:grid;grid-template-columns:1fr auto;align-items:center;gap:3px}
#operator-diagnostics #dw-progress-readout>span{font-size:10px;color:#68775a}
#operator-diagnostics #dw-progress-value{font:italic 28px Georgia,serif;color:#3c6538}
#operator-diagnostics #dw-progress-readout>p{grid-column:1 / -1;margin:2px 0 0;font-size:9px;line-height:1.5;color:#7a846c}
/* Per-station SVG footprints align interaction and glow to the authored art. */
#operator-diagnostics .dw-station{min-width:0;display:block;overflow:visible;border-radius:0;pointer-events:none}
#operator-diagnostics .dw-station:hover{margin-top:0;filter:none}#operator-diagnostics .dw-station:focus-visible{outline:0}
#operator-diagnostics .dw-station:before,#operator-diagnostics .dw-station:after{display:none}
#operator-diagnostics .dw-station-hit{position:absolute;inset:0;display:block;pointer-events:auto;cursor:pointer}
#operator-diagnostics .dw-station-footprint{position:absolute;inset:0;width:100%;height:100%;overflow:visible;opacity:0;filter:drop-shadow(0 0 0 transparent);transition:opacity .15s,filter .15s;pointer-events:none}
#operator-diagnostics .dw-station-footprint polygon{fill:#fff4b510;stroke:#fff0ad;stroke-width:1.5;stroke-linejoin:round;vector-effect:non-scaling-stroke}
#operator-diagnostics .dw-station:has(.dw-station-hit:hover) .dw-station-footprint,#operator-diagnostics .dw-station:focus-visible .dw-station-footprint{opacity:.82;filter:drop-shadow(0 0 4px #fff0a999)}
#operator-diagnostics .dw-station[aria-pressed=true] .dw-station-footprint{opacity:1;filter:drop-shadow(0 0 6px #ffe999cc)}
#operator-diagnostics .dw-station[data-playback=true] .dw-station-footprint{opacity:.78;filter:drop-shadow(0 0 7px #eafa9bbb)}
#operator-diagnostics .dw-station[data-state=failed] .dw-station-footprint{opacity:1;filter:drop-shadow(0 0 7px #ff9d7dcc)}
#operator-diagnostics .dw-station[data-state=failed] .dw-station-footprint polygon{fill:#ff9d7d14;stroke:#ffc09b}
#operator-diagnostics .dw-station-reveal{position:absolute;left:50%;bottom:calc(100% - 2px);display:flex;align-items:center;gap:6px;max-width:155px;padding:5px 9px 5px 5px;border:1px solid #d8d29b99;border-radius:20px;background:#15382fee;color:#fff9df;box-shadow:0 5px 15px #09221980;white-space:nowrap;opacity:0;visibility:hidden;transform:translate(-50%,5px);transition:opacity .15s,transform .15s,visibility .15s;pointer-events:none}
#operator-diagnostics .dw-reveal-number{display:grid;place-items:center;width:22px;height:22px;flex:0 0 auto;border-radius:50%;background:#6f8755;color:#fffde8;font:600 10px/1 ui-monospace,SFMono-Regular,Menlo,monospace}
#operator-diagnostics .dw-reveal-name{overflow:hidden;text-overflow:ellipsis;font:500 10px/1.25 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
#operator-diagnostics .dw-station:has(.dw-station-hit:hover) .dw-station-reveal,#operator-diagnostics .dw-station:focus-visible .dw-station-reveal,#operator-diagnostics .dw-station[aria-pressed=true] .dw-station-reveal{opacity:1;visibility:visible;transform:translate(-50%,0)}
#operator-diagnostics .dw-station[data-playback=true] .dw-reveal-number{background:#dce99e;color:#294330}
#operator-diagnostics .dw-station[data-state=failed] .dw-reveal-number{background:#a85339}
#operator-diagnostics .dw-person{display:none}
@media(min-width:1600px){#operator-diagnostics .dw-workspace{grid-template-columns:minmax(0,1fr) 355px}#operator-diagnostics .dw-station-label{font-size:12px}}
@media(max-width:1050px){#operator-diagnostics{padding:20px 18px}#operator-diagnostics .dw-workspace{grid-template-columns:minmax(0,1fr) 295px;gap:15px}#operator-diagnostics .dw-drawer{padding:18px 15px}#operator-diagnostics .dw-map-tools>span{font-size:13px}#operator-diagnostics .dw-live{max-width:380px}}
@media(max-width:800px){#operator-diagnostics{padding:20px 15px}#operator-diagnostics .dw-heading{display:block;margin-bottom:17px}#operator-diagnostics .dw-heading h1{font-size:35px}#operator-diagnostics .dw-live{margin-top:13px;max-width:none}#operator-diagnostics .dw-workspace{display:flex;flex-direction:column;gap:18px}#operator-diagnostics .dw-map-column,#operator-diagnostics .dw-drawer{width:100%}#operator-diagnostics .dw-viewport{min-height:360px;max-height:430px}#operator-diagnostics .dw-drawer{max-height:none;padding:20px}#operator-diagnostics .dw-map-tools>span{font-size:12px}#operator-diagnostics .dw-map-tools button{font-size:10px;padding:6px 8px}#operator-diagnostics .dw-legend{gap:6px 12px;font-size:9px}#operator-diagnostics .dw-heading p{font-size:9px}#operator-diagnostics #dw-title{font-size:28px}}
@media(max-width:800px){#operator-diagnostics .dw-content-house{grid-template-columns:42px 1fr}#operator-diagnostics .dw-content-house-mark{width:40px;height:38px}#operator-diagnostics .dw-content-house>strong{grid-column:2;text-align:left;max-width:none}}
@media(max-width:520px){#dw-finish-toast{right:14px;bottom:14px;grid-template-columns:92px 1fr}#dw-finish-toast>img{width:98px;max-height:125px;margin:-35px -4px -15px}#dw-finish-toast strong{font-size:20px}}
@media(prefers-reduced-motion:reduce){#operator-diagnostics *,#operator-diagnostics *:before,#operator-diagnostics *:after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
`;

// This function is serialized into the existing browser document. Its adapter inputs are explicit.
export function mountDiagnosticsWorld({ root, markup, stations, deriveState, lineage, agentPosition, readJobId }) {
  const oldChildren = Array.from(root.children);
  const jobOutput = root.querySelector('#operator-job-json');
  const pipeline = root.querySelector('#operator-pipeline');
  root.insertAdjacentHTML('afterbegin', markup);
  const find = id => root.querySelector('#' + id);
  const finishToast=find('dw-finish-toast');document.body.append(finishToast);
  find('dw-job-response').append(jobOutput);
  find('dw-legacy-inspector').append(pipeline);
  oldChildren.forEach(node => { if (node.parentElement === root) node.remove(); });
  const labels = {unknown:'No report',pending:'Waiting',active:'Working',completed:'Complete',failed:'Failed',paused:'Checkpoint'};
  const symbols = {unknown:'·',pending:'◷',active:'●',completed:'✓',failed:'!',paused:'Ⅱ'};
  const fullNames = Array.from(pipeline.querySelectorAll('#steps .step-name'), el => el.textContent.replace(/^\d+/, '').trim());
  const routeStations=stations.slice(0,12),routeLength=routeStations.length;
  // Authored against the 1536 × 1024 terrain. Each bounds/outline pair follows
  // the station's real architectural footprint rather than a generic marker.
  const hitAreas=[
    [70,48,218,168,[[3,35],[18,18],[45,17],[45,4],[78,4],[78,23],[95,30],[96,83],[72,96],[18,91],[2,70]]],
    [315,42,250,194,[[2,32],[18,21],[18,10],[70,1],[91,18],[100,42],[96,94],[8,98],[2,70]]],
    [586,35,200,222,[[4,35],[20,24],[37,24],[37,10],[53,0],[69,10],[69,22],[90,30],[99,53],[92,98],[13,98],[2,66]]],
    [790,58,270,190,[[0,23],[18,16],[18,7],[69,7],[69,17],[89,25],[98,50],[94,91],[62,98],[9,91],[1,67]]],
    [1032,72,276,184,[[3,35],[18,21],[37,16],[50,1],[66,15],[86,22],[98,41],[95,88],[76,98],[18,95],[1,72]]],
    [1060,300,270,220,[[5,31],[20,20],[20,10],[78,10],[78,22],[94,31],[99,68],[91,96],[15,98],[2,73]]],
    [775,260,270,235,[[1,42],[19,31],[29,31],[29,18],[49,1],[69,18],[69,29],[86,34],[99,52],[92,92],[72,99],[26,98],[7,82]]],
    [425,280,330,230,[[1,36],[10,27],[10,17],[24,10],[35,18],[48,7],[61,18],[74,8],[90,17],[99,34],[96,91],[78,98],[13,97],[2,74]]],
    [188,252,202,214,[[12,35],[24,27],[24,15],[39,7],[47,0],[55,7],[72,15],[72,28],[88,37],[96,78],[80,96],[18,97],[3,76]]],
    [205,550,315,260,[[0,45],[8,22],[18,20],[18,10],[72,10],[88,24],[96,45],[96,90],[82,98],[18,98],[3,80]]],
    [540,560,420,255,[[0,35],[7,20],[78,20],[78,28],[95,32],[100,65],[96,95],[15,99],[1,78]]],
    [990,540,420,290,[[0,45],[8,35],[14,35],[14,18],[30,18],[30,12],[84,12],[84,24],[95,31],[100,70],[94,96],[12,96],[2,78]]]
  ];
  const svgNS = 'http://www.w3.org/2000/svg';
  const paths = routeStations.slice(1).map((station, index) => {
    const previous = routeStations[index];
    const path = document.createElementNS(svgNS, 'path');
    path.classList.add('dw-path');
    path.setAttribute('d', 'M '+previous[1]+' '+(previous[2]+30)+' Q '+((previous[1]+station[1])/2)+' '+(Math.max(previous[2],station[2])+48)+' '+station[1]+' '+(station[2]+30));
    find('dw-paths').append(path);return path;
  });
  const readyPath=document.createElementNS(svgNS,'path');readyPath.classList.add('dw-path','dw-ready-path');readyPath.setAttribute('d','M 910 722 Q 1080 835 1195 855');find('dw-paths').append(readyPath);
  const MIN_STATION_DWELL=1700,TRAVEL_DURATION=450;
  let selected = 1, pinned = null, following = true, latestJob = null, model = deriveState(null), zoom = 1, dismissedFinishJob = null;
  let visualCurrent=null,lastLiveCurrent=null,visualEnteredAt=0,playbackQueue=[],playbackTimer=null,playbackEpoch=0;
  const buttons = routeStations.map((station, index) => {
    const area=hitAreas[index],points=area[4];
    const button = document.createElement('button');
    button.type='button';button.className='dw-station';button.dataset.stage=String(index+1);
    button.dataset.role=station[5];
    button.style.left=((area[0]+area[2]/2)/1536*100)+'%';button.style.top=((area[1]+area[3]/2)/1024*100)+'%';
    button.style.width=(area[2]/1536*100)+'%';button.style.height=(area[3]/1024*100)+'%';
    // The authored building is the station marker. Text appears only while the
    // hotspot is hovered, focused, or selected; the drawer carries full detail.
    const hit=document.createElement('span');hit.className='dw-station-hit';hit.style.clipPath='polygon('+points.map(point=>point[0]+'% '+point[1]+'%').join(',')+')';
    const footprint=document.createElementNS(svgNS,'svg');footprint.classList.add('dw-station-footprint');footprint.setAttribute('viewBox','0 0 100 100');footprint.setAttribute('preserveAspectRatio','none');footprint.setAttribute('aria-hidden','true');
    const outline=document.createElementNS(svgNS,'polygon');outline.setAttribute('points',points.map(point=>point.join(',')).join(' '));footprint.append(outline);hit.append(footprint);
    const reveal=document.createElement('span');reveal.className='dw-station-reveal';reveal.setAttribute('aria-hidden','true');
    const number=document.createElement('span');number.className='dw-reveal-number';number.textContent=String(index+1).padStart(2,'0');
    const name=document.createElement('span');name.className='dw-reveal-name';name.textContent=station[0];
    reveal.append(number,name);button.append(hit,reveal);button.onclick=()=>select(index+1,true);
    button.addEventListener('keydown',event=>{
      if(!['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Home','End'].includes(event.key))return;
      event.preventDefault();
      const target=event.key==='Home'?1:event.key==='End'?routeLength:Math.max(1,Math.min(routeLength,index+1+(['ArrowRight','ArrowDown'].includes(event.key)?1:-1)));
      select(target,false);buttons[target-1].focus();
    });
    find('dw-stations').append(button);return button;
  });
  // One person per station, no decorative background crowd. Motion has no independent timer.
  const agents=routeStations.map((station,index)=>{
    const person=document.createElement('span');person.className='dw-person';person.dataset.owner=String(index+1);
    person.dataset.role=station[5];person.style.setProperty('--agent-shirt',station[6]);
    person.innerHTML='<span class="dw-person-hat"></span><span class="dw-person-head"></span><span class="dw-person-shirt"></span><span class="dw-person-legs"></span><span class="dw-person-tool"></span>';
    find('dw-agents').append(person);return person;
  });
  function select(number, reveal) {
    selected=number;if(reveal)pinned=number;following=false;renderDetails();renderMarkers();
    if(reveal&&window.matchMedia('(max-width:800px)').matches)find('dw-drawer').scrollIntoView({block:'start',behavior:'auto'});
  }
  function hasUrgentIssue(job,nextModel){
    const status=String(job?.status||'').toLowerCase();
    return ['failed','error','warning','warn'].includes(status)||nextModel.unlocatedFailure||job?.error!=null||job?.warning!=null||(Array.isArray(job?.warnings)&&job.warnings.length>0);
  }
  function clearPlayback(){
    playbackEpoch+=1;if(playbackTimer!==null){clearTimeout(playbackTimer);playbackTimer=null}
    playbackQueue=[];paths.forEach(path=>delete path.dataset.playback);
  }
  function continuePlayback(){
    if(playbackTimer!==null||!playbackQueue.length)return;
    const epoch=playbackEpoch,wait=Math.max(0,MIN_STATION_DWELL-(Date.now()-visualEnteredAt));
    playbackTimer=setTimeout(()=>{
      playbackTimer=null;if(epoch!==playbackEpoch||!playbackQueue.length)return;
      const next=playbackQueue.shift(),from=visualCurrent;
      if(from&&next===from+1){root.dataset.lastHandoff=from+'-'+next;paths[from-1]?.setAttribute('data-playback','true')}
      playbackTimer=setTimeout(()=>{
        playbackTimer=null;if(epoch!==playbackEpoch)return;
        if(from)delete paths[from-1]?.dataset.playback;
        visualCurrent=next;visualEnteredAt=Date.now();renderMarkers();continuePlayback();
      },window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:TRAVEL_DURATION);
    },wait);
  }
  function updatePlayback(nextJob,nextModel,jobChanged){
    const live=nextModel.current&&nextModel.current<=routeLength?nextModel.current:null;
    if(jobChanged){clearPlayback();visualCurrent=live;lastLiveCurrent=live;visualEnteredAt=Date.now();return}
    if(hasUrgentIssue(nextJob,nextModel)){
      clearPlayback();visualCurrent=live;lastLiveCurrent=live;visualEnteredAt=Date.now();
      if(live){following=true;selected=live;pinned=live}
      return;
    }
    if(live===null){lastLiveCurrent=null;return}
    if(visualCurrent===null){visualCurrent=live;visualEnteredAt=Date.now()}
    if(lastLiveCurrent!==null&&live>lastLiveCurrent){
      for(let step=Math.max(lastLiveCurrent+1,visualCurrent+1);step<=live;step+=1)if(!playbackQueue.includes(step))playbackQueue.push(step);
    }else if(lastLiveCurrent!==null&&live<lastLiveCurrent){
      clearPlayback();visualCurrent=live;visualEnteredAt=Date.now();
    }
    lastLiveCurrent=live;continuePlayback();
  }
  function renderMarkers() {
    buttons.forEach((button,index)=>{
      const stage=model.stages[index];button.dataset.state=stage.state;
      button.dataset.current=String(model.current===index+1);
      button.dataset.next=String(model.current!==null&&model.current+1===index+1);
      button.dataset.playback=String(visualCurrent===index+1);
      button.setAttribute('aria-pressed',String(pinned===index+1));
      button.setAttribute('aria-label',(index+1)+'. '+stations[index][0]+': '+labels[stage.state]+(model.current===index+1?'. Current reported stage.':''));
      const position=agentPosition(routeStations,index,stage.state,model.progress);
      agents[index].style.left=(position.x/1536*100)+'%';agents[index].style.top=(position.y/1024*100)+'%';
      agents[index].dataset.state=stage.state;agents[index].dataset.selected=String(selected===index+1);
      agents[index].title=(index+1)+'. '+stations[index][0]+' agent'+(stage.state==='active'&&model.progress!==null?' · reported job progress '+model.progress+'%':' · at station');
    });
    paths.forEach((path,index)=>{
      const from=model.stages[index],to=model.stages[index+1];
      path.dataset.state=from.state==='completed'&&to.state==='completed'?'completed':'unknown';
    });
    readyPath.dataset.state=['completed','complete','succeeded'].includes(String(latestJob?.status||'').toLowerCase())?'active':'unknown';
  }
  function renderDetails() {
    const station=stations[selected-1],stage=model.stages[selected-1];
    find('dw-number').textContent=String(selected).padStart(2,'0');find('dw-place').textContent=station[3];find('dw-title').textContent=station[0];
    find('dw-state').textContent=symbols[stage.state]+' '+labels[stage.state];find('dw-state').dataset.state=stage.state;
    find('dw-evidence').textContent=stage.evidence;find('dw-agent').textContent=fullNames[selected-1]||station[0];
    find('dw-progress-readout').hidden=selected!==model.current||model.progress===null;
    find('dw-progress-value').textContent=model.progress===null?'':model.progress+'%';
    find('dw-next').textContent=selected<routeLength?(selected+1)+' / '+routeStations[selected][0]:'Ready to Review';
    find('dw-previous').disabled=selected===1;find('dw-next-station').disabled=selected===routeLength;
    const keys=Object.keys(stage.outputs);
    find('dw-output-summary').textContent=keys.length?keys.length+' field'+(keys.length===1?'':'s')+' available. Open Raw data to inspect the exact values.':'No output explicitly associated with this station has been reported. The full response remains available in Raw data.';
    find('dw-output-fields').replaceChildren(...keys.map(key=>{const el=document.createElement('span');el.className='dw-output-field';el.textContent=key;return el}));
    find('dw-output-json').textContent=keys.length?JSON.stringify(stage.outputs,null,2):'No station output reported.';
    const liveIssue=selected===model.current?(latestJob?.error??latestJob?.warning??latestJob?.warnings):null;
    const error=stage.error??liveIssue;find('dw-error').hidden=error===undefined||error===null||error===''||(Array.isArray(error)&&error.length===0);find('dw-error').textContent=typeof error==='string'?error:error==null?'':JSON.stringify(error,null,2);
    const rows=lineage(latestJob),container=find('dw-lineage');container.replaceChildren();
    if(!rows.length){const p=document.createElement('p');p.textContent='No shot lineage has been reported yet.';container.append(p)}
    rows.slice(0,100).forEach(row=>{
      const el=document.createElement('div');el.className='dw-lineage-row';
      const title=document.createElement('strong');title.textContent=(row.shot_id??'Not reported')+' → '+(row.source_id??'Not reported');
      const path=document.createElement('span');path.textContent=row.local_path??'Local path not reported';
      const range=document.createElement('span');range.textContent=(row.start_sec??'—')+'s → '+(row.end_sec??'—')+'s';
      const resolution=document.createElement('span');resolution.textContent='Source: '+row.source_resolution;
      el.append(title,path,range,resolution);container.append(el);
    });
    if(rows.length>100){const p=document.createElement('p');p.textContent='Showing 100 of '+rows.length+' shots. All identities remain in the full job response.';container.append(p)}
  }
  function finalOutputUrl(job){
    const candidate=job?.outputDriveUrl??job?.output_url??job?.final_video_url??job?.output?.url;
    return typeof candidate==='string'&&/^https:\/\//i.test(candidate)?candidate:null;
  }
  function renderFinishToast(){
    const status=String(latestJob?.status||'').toLowerCase();
    const finished=['completed','complete','succeeded','ready_for_review','approved','published'].includes(status);
    finishToast.hidden=!finished||!latestJob?.job_id||dismissedFinishJob===latestJob.job_id;
  }
  function render() {
    const classes=Array.from(pipeline.querySelectorAll('#steps .step'),el=>el.className);
    model=deriveState(latestJob,classes);
    const onRoute=model.current&&model.current<=routeLength;
    if(following&&onRoute)selected=model.current;
    find('dw-current').disabled=!onRoute;
    const active=onRoute?model.stages[model.current-1]:null;
    const status=String(latestJob?.status||'').toLowerCase(),approved=['approved','published'].includes(status),ready=['completed','complete','succeeded','ready_for_review'].includes(status);
    find('dw-ready-review').dataset.state=ready?'active':'pending';
    find('dw-content-house').dataset.state=approved?'approved':'waiting';
    find('dw-content-state').textContent=approved?'Current job approved · available to Content House':'Waiting for approved content';
    find('dw-response-dot').dataset.state=active?.state||(model.unlocatedFailure?'failed':approved||ready?'completed':'unknown');
    find('dw-world-status').textContent=!latestJob?'Waiting for a job':approved?'Approved content · outside active route':ready?'Ready to Review':onRoute?model.current+' / '+routeStations[model.current-1][0]+' · '+labels[active.state]:model.unlocatedFailure?'Job failed · stage not reported':'Job response · '+model.status;
    find('dw-world-context').textContent=!latestJob?'Select a station to explore. No job response yet.':approved?'This job has left the active pipeline and belongs in Content House.':ready?'The 12-stage production journey is complete.':model.unlocatedFailure?'Open Raw data for the error. Its location has not been reported.':onRoute?(model.current<routeLength?'Route to '+(model.current+1)+' / '+routeStations[model.current][0]:'Render verification is the final active station.')+' · '+(model.progress===null?'Progress not reported.':model.progress+'% reported job progress.'):'The job is outside the active 12-stage route. Inspect Raw data for its exact state.';
    renderMarkers();renderDetails();renderFinishToast();
  }
  function handoff(fromNumber,toNumber) {
    if(toNumber!==fromNumber+1||toNumber>routeLength)return;
    root.dataset.lastHandoff=fromNumber+'-'+toNumber;
    const person=agents[fromNumber-1],from=stations[fromNumber-1],to=stations[toNumber-1];
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    person.dataset.handoff='true';
    const keyframes=[
      {left:(from[1]/1536*100)+'%',top:((from[2]+30)/1024*100)+'%',offset:0},
      {left:(to[1]/1536*100)+'%',top:((to[2]+30)/1024*100)+'%',offset:.58},
      {left:(to[1]/1536*100)+'%',top:((to[2]+30)/1024*100)+'%',offset:.72},
      {left:(from[1]/1536*100)+'%',top:((from[2]+30)/1024*100)+'%',offset:1}
    ];
    if(typeof person.animate!=='function'){delete person.dataset.handoff;return}
    const motion=person.animate(keyframes,{duration:1700,easing:'ease-in-out'});
    motion.finished.catch(()=>{}).finally(()=>{delete person.dataset.handoff;renderMarkers()});
  }
  find('dw-previous').onclick=()=>select(Math.max(1,selected-1),false);
  find('dw-next-station').onclick=()=>select(Math.min(routeLength,selected+1),false);
  finishToast.querySelector('#dw-finish-close').onclick=()=>{dismissedFinishJob=latestJob?.job_id??null;finishToast.hidden=true};
  finishToast.querySelector('#dw-finish-review').onclick=()=>{
    const url=finalOutputUrl(latestJob);
    if(url){window.open(url,'_blank','noopener,noreferrer');return}
    document.querySelector('[data-view="production"]')?.click();
    document.querySelector('#operator-production')?.scrollIntoView({block:'start',behavior:'auto'});
  };
  find('dw-current').onclick=()=>{
    if(!model.current||model.current>routeLength)return;following=true;selected=model.current;renderMarkers();renderDetails();
    buttons[selected-1].scrollIntoView({block:'nearest',inline:'center',behavior:'auto'});buttons[selected-1].focus({preventScroll:true});
  };
  function setZoom(change){
    zoom=Math.max(.8,Math.min(1.8,Math.round((zoom+change)*10)/10));
    const base=Math.max(900,find('dw-viewport').clientWidth);
    find('dw-map').style.minWidth='0';
    find('dw-map').style.setProperty('--dw-map-width',Math.round(base*zoom)+'px');
    find('dw-zoom-level').textContent=Math.round(zoom*100)+'%';
    find('dw-zoom-out').disabled=zoom===.8;find('dw-zoom-in').disabled=zoom===1.8;
  }
  find('dw-zoom-out').onclick=()=>setZoom(-.2);find('dw-zoom-in').onclick=()=>setZoom(.2);
  const detailTabs=Array.from(root.querySelectorAll('[data-dw-tab]'));
  detailTabs.forEach((button,index)=>{
    button.onclick=()=>detailTabs.forEach(tab=>{const active=tab===button;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;find('dw-panel-'+tab.dataset.dwTab).hidden=!active});
    button.tabIndex=index===0?0:-1;
    button.onkeydown=event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();const next=detailTabs[(index+(event.key==='ArrowRight'?1:2))%3];next.click();next.focus()};
  });
  // Observe the response already accepted by the operator adapter; never add a fetch or timer.
  let queued=false;
  function applyJob(next){
    const jobChanged=next?.job_id!==latestJob?.job_id;
    if(jobChanged){following=true;selected=1;pinned=null}
    const classes=Array.from(pipeline.querySelectorAll('#steps .step'),el=>el.className);
    const nextModel=deriveState(next,classes);
    latestJob=next;model=nextModel;updatePlayback(next,nextModel,jobChanged);render();
  }
  function schedule(){if(queued)return;queued=true;queueMicrotask(()=>{queued=false;sync()})}
  function sync(){
    let parsed=null;try{parsed=JSON.parse(jobOutput.textContent)}catch{}
    applyJob(parsed&&parsed.job_id===readJobId()?parsed:null);
  }
  // Consume the same browser event emitted by existing polling. This listener is
  // read-only and keeps Diagnostics current even when text-node observation is delayed.
  document.addEventListener('qn:job-start',()=>applyJob(null));
  document.addEventListener('qn:job-response',event=>{
    const next=event.detail;
    if(next&&next.job_id===readJobId())applyJob(next);
  });
  new MutationObserver(schedule).observe(jobOutput,{childList:true,subtree:true,characterData:true});
  new MutationObserver(schedule).observe(find('steps'),{attributes:true,attributeFilter:['class'],childList:true,subtree:true});
  sync();
}
