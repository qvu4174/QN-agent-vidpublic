const VIDEO_MIME_TYPES = new Set([
  "video/mp4", "video/quicktime", "video/x-msvideo", "video/webm",
  "video/mpeg", "video/x-matroska", "video/3gpp", "video/3gpp2", "video/avi", "video/mp2t"
]);

const QN_VIDEO_INSTRUCTIONS = `# QN VIDEO v1

## Core Creative Identity

QN reels should feel calm, observant, rural, cinematic, and human. Give the viewer enough time to notice the place instead of rushing through footage. Prefer atmosphere, movement through space, texture, weather, roads, fields, trees, water, people, and small local details over generic travel-montage energy.

Avoid hyper-fast pacing, cuts made only to create activity, weak clips included for variety, excessive transitions, and oversized or frequent text.

## Shot Selection

Prioritize the strongest footage. A clip earns its place through composition, useful movement, atmosphere, narrative progression, distinctive local detail, or a strong opening or ending image. When clips repeat the same idea, choose the most convincing one unless repetition deliberately serves rhythm or progression.

## Pacing and Transitions

Use a slow-to-moderate documentary rhythm and let useful shots breathe. A starting guide is 3-5 seconds for ordinary moving shots, 4-7 seconds for rich establishing shots, 2.5-4 seconds for details, and extra room for a resolving final shot. These are guidance, not hard limits.

Prefer a straight cut when motion or composition flows naturally, and a short dissolve or crossfade when changing atmosphere, place, or time. Avoid flashy presets, glitch effects, and transitions that attract more attention than the footage.

## Visual Grade

Keep natural greens and sky, restrained saturation, useful contrast, and a neutral to slightly cool temperature. Avoid oversaturated tourism color and heavy orange/teal treatment. Preserve a natural image before making it cinematic.

## Text and Audio

Text supports the footage rather than competing with it. Use short, readable lines sparingly, place them in negative space, and do not cover the subject. Let the image register before introducing text and remove text before it becomes stale.

Music should be cinematic, reflective, organic, and gradual. Avoid aggressive beat-cutting and music that makes rural footage feel like a generic commercial.

## Reel Directions

COCO is landscape-first and observational: use coconut trees, fields, sky, wind, natural movement, and quiet environmental detail. A useful progression is hook, landscape, detail, wider payoff, and a memorable calm resolution.

RIDE is movement-first but calm: use roads, forward motion, changing scenery, fields, village roads, and arrival. Connect scenes with movement rather than increasing cut speed.

HUMAN prioritizes interactions, work, gestures, faces, hands, and natural sound when useful. Human behavior and narrative take priority over purely beautiful scenery.

## Agent Decision Rules

1. Inspect all source clips before deciding the sequence.
2. Rank clips by visual strength and identify redundant shots.
3. Choose the reel concept before filling the timeline.
4. Build a beginning, middle, and ending.
5. Prefer visual continuity over arbitrary chronology.
6. Use text only where it adds meaning.
7. Keep transitions simple.
8. Do not force every clip into the reel.

## What Automated Analysis Should Measure vs What the Editing Agent Should Decide

Automated analysis may measure:
- media metadata
- frame characteristics
- audio characteristics
- motion
- exposure
- technical quality

The editing agent should decide:
- reel concept
- strongest and rejected shots
- trim points
- sequence and pacing
- transitions
- text and placement
- emotional progression

Do not let numeric measurements override visual judgment.`.trim();

const HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="theme-color" content="#101311" />
  <title>QN Video Planner</title>
  <style>
    :root{color-scheme:dark;--bg:#101311;--panel:#191e1b;--panel2:#121714;--line:#344039;--text:#edf2e9;--muted:#9aa99e;--accent:#c9f27c;--danger:#ff9b91}
    *{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 80% 0,#263227 0,transparent 38%),var(--bg);color:var(--text);font:15px/1.5 ui-sans-serif,system-ui,sans-serif}
    .wrap{max-width:920px;margin:auto;padding:42px 20px 70px}header{border-bottom:1px solid var(--line);padding-bottom:24px;margin-bottom:24px}.eyebrow{color:var(--accent);font-size:11px;font-weight:800;letter-spacing:.14em}h1{font-size:32px;line-height:1.1;margin:8px 0}.sub{color:var(--muted)}
    .panel{background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:20px;margin-bottom:16px}label{display:block;color:var(--muted);font-size:12px;font-weight:700;letter-spacing:.08em;margin-bottom:8px}input,button{font:inherit}input{width:100%;background:var(--panel2);color:var(--text);border:1px solid var(--line);border-radius:5px;padding:11px}button{border:0;border-radius:5px;padding:11px 15px;font-weight:800;cursor:pointer}button:disabled{opacity:.5;cursor:not-allowed}.primary{background:var(--accent);color:#11170e}.secondary{background:#29332c;color:var(--text);border:1px solid #465448}.drive-head{display:flex;justify-content:space-between;align-items:center;gap:14px}.drive-head button{width:auto;pointer-events:auto;position:relative;z-index:1}.status{color:var(--muted);font-size:13px;margin-top:10px;min-height:20px}.error{color:var(--danger)}.files{display:grid;gap:8px;margin-top:14px}.file{display:flex;align-items:center;justify-content:space-between;gap:12px;background:var(--panel2);border:1px solid var(--line);border-radius:5px;padding:10px}.file-details{min-width:0}.file-name{font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.small{color:var(--muted);font-size:12px;word-break:break-all}.remove-file{flex:0 0 auto;width:auto;padding:2px 7px;background:transparent;color:var(--muted);font-size:18px;line-height:1;border:1px solid transparent}.remove-file:hover,.remove-file:focus-visible{color:var(--danger);border-color:var(--line)}.actions{display:flex;gap:10px;margin-top:14px}.actions button{flex:1}pre{background:#0c100e;border:1px solid var(--line);border-radius:5px;min-height:220px;max-height:540px;overflow:auto;margin:0;padding:15px;white-space:pre-wrap;word-break:break-word;font:13px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace}
    @media(max-width:600px){.wrap{padding:28px 14px 50px}h1{font-size:27px}.drive-head{align-items:flex-start;flex-direction:column}.drive-head button{width:100%}.actions{flex-direction:column}}
  </style>
</head>
<body>
  <main class="wrap">
    <header><div class="eyebrow">QN VIDEO PLANNER</div><h1>Footage to edit plan.</h1><p class="sub">Select source clips from the restricted Drive folder, then ask Gemini to shape the first cut.</p></header>
    <section class="panel"><label for="control-key">CONTROL KEY</label><input id="control-key" type="password" autocomplete="current-password" placeholder="Enter control key" /><div id="auth-status" class="status"></div><div id="client-status" class="status"></div></section>
    <section class="panel">
      <div class="drive-head"><div><label>GOOGLE DRIVE SOURCE CLIPS</label><div id="drive-status" class="status" style="margin-top:0">Not connected</div></div><button id="drive-connect" class="secondary" type="button">CONNECT GOOGLE DRIVE</button></div>
      <button id="select-files" class="secondary" type="button" disabled style="margin-top:14px">SELECT DRIVE FILES</button>
      <div id="drive-message" class="status">Connect Google Drive to begin.</div><div id="selected-files" class="files"><div class="small">No source clips selected.</div></div>
      <button id="analyze" class="primary" type="button" disabled style="width:100%;margin-top:14px">ANALYZE WITH GEMINI</button>
    </section>
    <section class="panel"><label>AI EDIT PLAN</label><pre id="output">No edit plan generated yet.</pre><div class="actions"><button id="download" class="secondary" type="button" disabled>DOWNLOAD EDIT.JSON</button></div><div id="message" class="status"></div></section>
  </main>
  <script src="https://accounts.google.com/gsi/client" async defer onload="initializeGoogleOnLoad()" onerror="handleGoogleLoadError('Google Identity Services failed to load.')"></script>
  <script src="https://apis.google.com/js/api.js" async defer onload="initializePickerOnLoad()" onerror="handleGoogleLoadError('Google Picker failed to load.')"></script>
  <script>
    const CONFIG = __QN_GOOGLE_CONFIG__;
    const SOURCE_FOLDER_ID = CONFIG.sourceFolderId || "";
    const $ = id => document.getElementById(id);
    document.addEventListener("DOMContentLoaded", () => { $("client-status").textContent = "Client JS loaded"; });
    let accessToken = null;
    let tokenClient = null;
    let pickerReady = false;
    let editPlan = null;
    const selectedFiles = new Map();
    const VIDEO_MIME_TYPES = new Set(["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm", "video/mpeg", "video/x-matroska", "video/3gpp", "video/3gpp2", "video/avi", "video/mp2t"]);

    function setDriveMessage(text, isError = false) { $("drive-message").textContent = text; $("drive-message").className = "status" + (isError ? " error" : ""); }
    function setMessage(text, isError = false) { $("message").textContent = text; $("message").className = "status" + (isError ? " error" : ""); }
    function hasGoogleOAuth() { return !!(window.google && google.accounts && google.accounts.oauth2); }
    function initializeGoogle() {
      if (!CONFIG.clientId || !CONFIG.apiKey || !CONFIG.appId || !SOURCE_FOLDER_ID) throw new Error("Google Drive browser configuration is incomplete.");
      if (!hasGoogleOAuth()) throw new Error("Google Identity Services is unavailable.");
      if (!tokenClient) tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CONFIG.clientId, scope: "https://www.googleapis.com/auth/drive.file", callback: handleToken,
        error_callback: error => { const message = error.error_description || error.error || "Google OAuth failed."; console.error("Google OAuth failed", error); setDriveMessage(message, true); setMessage(message, true); }
      });
      return !!tokenClient;
    }
    function initializePickerOnLoad() {
      try {
        if (!window.gapi) throw new Error("Google Picker is unavailable.");
        gapi.load("picker", () => { pickerReady = true; });
      } catch (error) { console.error("Google Picker initialization failed", error); setDriveMessage(error.message, true); }
    }
    function initializeGoogleOnLoad() {
      try {
        if (initializeGoogle()) {
          setDriveMessage("Google Drive is ready to connect.");
        } else {
          throw new Error("Google Identity Services is still unavailable.");
        }
      } catch (error) {
        console.error("Google OAuth initialization failed", error);
        setDriveMessage(error.message, true);
      }
    }
    function handleGoogleLoadError(message) {
      const error = new Error(message);
      console.error("Google OAuth initialization failed", error);
      setDriveMessage(message, true);
    }
    function connectGoogleDrive() {
      try {
        if (accessToken) { accessToken = null; $("drive-connect").textContent = "CONNECT GOOGLE DRIVE"; $("select-files").disabled = true; $("drive-status").textContent = "Not connected"; setDriveMessage("Connect Google Drive to begin."); return; }
        if (!tokenClient) throw new Error("Google OAuth is not ready yet. Wait for Google Identity Services to load and try again.");
        tokenClient.requestAccessToken({ prompt: "consent" });
      } catch (error) { console.error("Google Drive initialization failed", error); setDriveMessage(error.message || "Google Drive initialization failed.", true); setMessage("Google Drive initialization failed. See the page status.", true); }
    }
    function handleToken(response) {
      if (response.error) { const message = response.error_description || response.error; console.error("Google OAuth failed", response); setDriveMessage(message, true); setMessage(message, true); return; }
      accessToken = response.access_token; $("drive-connect").textContent = "DISCONNECT GOOGLE DRIVE"; $("select-files").disabled = false; $("drive-status").textContent = "Connected to Google Drive"; setDriveMessage("Choose one or more video clips.");
    }
    function openPicker() {
      try {
        if (!accessToken) throw new Error("Connect Google Drive first.");
        if (!pickerReady || !window.google?.picker) { setDriveMessage("Google Picker is still loading. Try again in a moment.", true); return; }
        const view = new google.picker.DocsView(google.picker.ViewId.DOCS).setIncludeFolders(true).setSelectFolderEnabled(false).setParent(SOURCE_FOLDER_ID).setMimeTypes([...VIDEO_MIME_TYPES].join(","));
        new google.picker.PickerBuilder().setAppId(CONFIG.appId).setDeveloperKey(CONFIG.apiKey).setOAuthToken(accessToken).addView(view).enableFeature(google.picker.Feature.MULTISELECT_ENABLED).setCallback(pickerCallback).build().setVisible(true);
      } catch (error) { console.error("Google Picker initialization failed", error); setDriveMessage(error.message, true); }
    }
    function pickerCallback(data) {
      if (data.action === google.picker.Action.CANCEL) return setDriveMessage("File selection cancelled.");
      if (data.action === google.picker.Action.ERROR) return setDriveMessage("Google Picker returned an error. Reconnect and retry.", true);
      if (data.action !== google.picker.Action.PICKED) return;
      (data.docs || []).forEach(file => { const name = file.name || "Untitled video"; const mimeType = file.mimeType || ""; if (VIDEO_MIME_TYPES.has(mimeType) || /\.(mov|mp4|avi|webm|m4v|mpeg|mpg|mkv|3gp|3g2)$/i.test(name)) selectedFiles.set(file.id, { id: file.id, name, mimeType: mimeType || "video/mp4", sizeBytes: file.sizeBytes || undefined }); });
      renderFiles(); setDriveMessage(selectedFiles.size + " clip(s) selected.");
    }
    function renderFiles() { $("selected-files").innerHTML = selectedFiles.size ? [...selectedFiles.values()].map(file => '<div class="file"><div class="file-details"><div class="file-name">' + escapeHtml(file.name) + '</div><div class="small">' + escapeHtml(file.mimeType) + '</div></div><button class="remove-file" type="button" data-file-id="' + escapeHtml(file.id) + '" aria-label="Remove ' + escapeHtml(file.name) + '">&times;</button></div>').join("") : '<div class="small">No source clips selected.</div>'; $("analyze").disabled = !selectedFiles.size; $("selected-files").querySelectorAll("[data-file-id]").forEach(button => button.addEventListener("click", () => { selectedFiles.delete(button.dataset.fileId); renderFiles(); })); }
    function escapeHtml(value) { return String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","\\\"":"&quot;","'":"&#039;"}[char])); }
    function authHeaders() { return { "content-type": "application/json", "x-control-key": $("control-key").value.trim() }; }
    $("control-key").addEventListener("input", async () => {
      const status = $("auth-status");
      if (!$("control-key").value.trim()) { status.textContent = ""; return; }
      status.textContent = "Checking control key...";
      try {
        const response = await fetch("/api/auth/check", { method: "POST", headers: authHeaders() });
        const data = await response.json();
        status.textContent = data.valid ? "✓ Control key valid" : "✕ Invalid control key";
        status.className = "status" + (data.valid ? "" : " error");
      } catch (error) { console.error("Control-key check failed", error); status.textContent = error.message; status.className = "status error"; }
    });
    $("drive-connect").addEventListener("click", connectGoogleDrive);
    $("select-files").addEventListener("click", openPicker);
    $("analyze").addEventListener("click", async () => {
      $("analyze").disabled = true; setMessage("Analyzing footage with Gemini...");
      try { const response = await fetch("/api/analyze", { method: "POST", headers: authHeaders(), body: JSON.stringify({ fileIds: [...selectedFiles.keys()], driveAccessToken: accessToken }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Analysis failed."); editPlan = data.editPlan; $("output").textContent = JSON.stringify(editPlan, null, 2); $("download").disabled = false; setMessage("Edit plan generated."); }
      catch (error) { console.error("Edit-plan request failed", error); setMessage(error.message, true); }
      finally { $("analyze").disabled = !selectedFiles.size; }
    });
    $("download").addEventListener("click", () => { if (!editPlan) return; const url = URL.createObjectURL(new Blob([JSON.stringify(editPlan, null, 2) + "\\n"], { type: "application/json" })); const link = document.createElement("a"); link.href = url; link.download = "edit.json"; link.click(); URL.revokeObjectURL(url); });
    renderFiles();
  </script>
</body>
</html>`;

const PIPELINE_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><meta name="theme-color" content="#0b0f0d" />
  <title>QN Reel Pipeline</title>
  <style>
    :root{color-scheme:dark;--bg:#0b0f0d;--panel:#141a16;--panel2:#0e1411;--line:#29372e;--text:#e8eee7;--muted:#8f9e94;--accent:#b9ed72;--accent2:#78c86b;--warn:#f2c66d;--danger:#ef867c}*{box-sizing:border-box}body{margin:0;background:linear-gradient(135deg,#0b0f0d 0%,#111a14 52%,#0b0f0d 100%);color:var(--text);font:13px/1.45 ui-sans-serif,system-ui,sans-serif}.app{display:grid;grid-template-columns:218px minmax(600px,1fr) 274px;min-height:100vh}.sidebar{border-right:1px solid var(--line);padding:25px 16px;background:#0d120f}.brand{display:flex;gap:10px;align-items:center;margin:0 8px 38px}.mark{display:grid;place-items:center;width:29px;height:29px;border:1px solid var(--accent);border-radius:7px;color:var(--accent);font-weight:900}.brand strong{display:block;font-size:14px;letter-spacing:.02em}.brand small{display:block;color:var(--muted);font-size:10px;margin-top:2px}.nav{display:grid;gap:4px}.nav button{display:flex;align-items:center;gap:11px;width:100%;border:0;border-radius:5px;background:transparent;color:var(--muted);padding:10px 11px;text-align:left;font:inherit}.nav button.active{background:#1c2a20;color:var(--text);box-shadow:inset 2px 0 var(--accent)}.nav button:not(.active){cursor:not-allowed;opacity:.62}.nav span{width:17px;text-align:center;color:var(--accent);font-size:12px}.main{min-width:0;padding:26px 28px 50px}.topbar{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:24px}.kicker,.label{font-size:10px;font-weight:800;letter-spacing:.13em;color:var(--muted)}h1{margin:5px 0 4px;font-size:25px;letter-spacing:-.02em}h2,h3,p{margin-top:0}.sub{color:var(--muted);margin:0}.top-actions{display:flex;gap:8px;flex-shrink:0}button{font:inherit;cursor:pointer}.btn{border:1px solid var(--line);border-radius:5px;padding:9px 13px;color:var(--text);background:#1b251e;font-weight:700}.btn.primary{background:var(--accent);border-color:var(--accent);color:#10160d}.btn:disabled{opacity:.45;cursor:not-allowed}.progress-wrap{border:1px solid var(--line);border-radius:7px;background:rgba(20,26,22,.84);padding:16px;margin-bottom:18px;overflow:hidden}.group-row{display:flex;gap:8px;margin-bottom:11px}.group{font-size:10px;font-weight:800;letter-spacing:.1em;color:var(--muted);padding-left:4px}.group:first-child{width:29%}.group:nth-child(2){width:36%}.group:last-child{flex:1}.steps{display:grid;grid-template-columns:repeat(17,minmax(30px,1fr));gap:5px}.step{min-width:0}.step-line{height:4px;border-radius:3px;background:#29342c;margin-bottom:6px}.step.active .step-line{background:var(--accent)}.step.failed .step-line{background:var(--danger)}.step-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--muted);font-size:10px}.step.active .step-name{color:var(--text);font-weight:700}.step-no{color:#647269;font-size:10px;margin-right:3px}.workspace{display:grid;grid-template-columns:minmax(210px,.78fr) minmax(330px,1.45fr);gap:16px}.panel{background:var(--panel);border:1px solid var(--line);border-radius:7px;padding:17px;margin-bottom:16px}.panel-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:15px}.panel-title{font-size:11px;font-weight:800;letter-spacing:.12em}.muted{color:var(--muted)}.drive-state{color:var(--accent);font-size:11px;margin-top:4px}.drive-actions{display:grid;gap:8px;margin-bottom:13px}.drive-actions .btn{width:100%;text-align:center}.files{display:grid;gap:7px}.file{display:flex;align-items:center;gap:9px;border:1px solid var(--line);background:var(--panel2);border-radius:5px;padding:9px}.thumb{width:38px;height:31px;border-radius:3px;background:#263229;display:grid;place-items:center;color:#718177;flex-shrink:0}.file-body{min-width:0;flex:1}.file-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:700}.file-meta{color:var(--muted);font-size:10px;margin-top:2px}.remove{border:0;background:transparent;color:var(--muted);font-size:18px;padding:0 3px}.remove:hover{color:var(--danger)}.status{min-height:18px;color:var(--muted);font-size:11px}.error{color:var(--danger)}.agent-head{display:flex;align-items:center;gap:10px;margin-bottom:4px}.agent-head h2{font-size:18px;margin:0}.ready-dot{width:8px;height:8px;border-radius:50%;background:var(--accent)}.agent-description{color:var(--muted);margin:0 0 17px;max-width:650px}.tabs{display:flex;gap:18px;border-bottom:1px solid var(--line);margin:0 -17px 17px;padding:0 17px}.tab{border:0;border-bottom:2px solid transparent;background:transparent;color:var(--muted);padding:8px 0;font-size:12px}.tab.active{border-color:var(--accent);color:var(--text)}.overview{display:grid;grid-template-columns:1fr 1fr;gap:15px}.section-title{font-size:10px;letter-spacing:.11em;font-weight:800;color:var(--muted);margin-bottom:9px}.facts{display:grid;gap:7px}.fact{display:flex;justify-content:space-between;gap:8px;color:var(--muted);font-size:11px}.fact strong{color:var(--text);font-weight:600;text-align:right}.json-title{display:flex;justify-content:space-between;align-items:center;margin:22px 0 8px}.json-title strong{font-size:12px}.json-title span{color:var(--accent);font:11px ui-monospace,monospace}pre{margin:0;min-height:190px;max-height:380px;overflow:auto;background:#090d0a;border:1px solid var(--line);border-radius:5px;padding:14px;color:#b8d9a0;font:11px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap;word-break:break-word}.rightbar{border-left:1px solid var(--line);padding:26px 17px;background:#0d120f}.rightbar .panel{background:#121814}.metric-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px 14px}.metric{color:var(--muted);font-size:11px}.metric strong{display:block;color:var(--text);font-size:18px;margin-top:1px}.metric strong.green{color:var(--accent)}.preview{border-left:2px solid var(--accent);padding-left:11px}.preview .step-no{color:var(--accent)}.preview h3{font-size:14px;margin:5px 0}.preview p{color:var(--muted);font-size:11px;margin:0}.auth{margin-top:auto;padding-top:28px}.auth input{width:100%;background:var(--panel2);border:1px solid var(--line);border-radius:4px;padding:8px;color:var(--text);margin-top:7px}.hidden{display:none}@media(max-width:1120px){.app{grid-template-columns:190px minmax(500px,1fr)}.rightbar{grid-column:2;border-left:0;border-top:1px solid var(--line);display:grid;grid-template-columns:1fr 1fr;gap:0 14px}.rightbar .panel{height:max-content}.auth{grid-column:1/-1}.workspace{grid-template-columns:1fr}.source-panel{order:2}}@media(max-width:700px){.app{display:block}.sidebar{border-right:0;border-bottom:1px solid var(--line);padding:13px 14px}.brand{margin:0 0 12px}.nav{display:flex;overflow:auto}.nav button{white-space:nowrap;width:auto}.main{padding:20px 14px}.topbar{display:block}.top-actions{margin-top:15px}.top-actions .btn{flex:1}.group-row{display:none}.steps{gap:3px}.step-name{display:none}.workspace{display:block}.rightbar{display:block;padding:18px 14px}.overview{grid-template-columns:1fr}.progress-wrap{padding:13px}}
  </style>
</head>
<body><div class="app">
  <aside class="sidebar"><div class="brand"><div class="mark">QN</div><div><strong>QN Reel Pipeline</strong><small>17-Step AI Video Editor</small></div></div><nav class="nav"><button class="active"><span>01</span>Pipeline</button><button><span>02</span>Jobs</button><button><span>03</span>History</button><button><span>04</span>Reel Memory</button><button><span>05</span>MacBook Agent</button><button><span>06</span>Style Profile</button><button><span>07</span>Logs</button><button><span>08</span>Settings</button></nav></aside>
  <main class="main"><header class="topbar"><div><div class="kicker">PIPELINE / NEW JOB</div><h1>New Reel Pipeline</h1><p class="sub">Từ Google Drive → Reel hoàn chỉnh</p></div><div class="top-actions"><button class="btn">Save Draft</button><button class="btn primary" id="start" disabled>Start Pipeline</button></div></header>
    <section class="progress-wrap"><div class="group-row"><div class="group">UNDERSTAND FOOTAGE</div><div class="group">BUILD THE REEL</div><div class="group">LEARN + PUBLISH</div></div><div class="steps" id="steps"></div></section>
    <div class="workspace"><section class="panel source-panel"><div class="panel-head"><div><div class="panel-title">SOURCE CLIPS</div><div class="drive-state" id="drive-status">Not connected</div></div><span class="muted" id="clip-count">0 / 10</span></div><div class="drive-actions"><button class="btn" id="drive-connect">Connect Google Drive</button><button class="btn" id="select-files" disabled>Select Drive Files</button></div><div class="status" id="drive-message">Connect Google Drive to begin.</div><div class="files" id="selected-files"><div class="muted">No source clips selected.</div></div><div class="auth"><label class="label" for="control-key">CONTROL KEY</label><input id="control-key" type="password" autocomplete="current-password" placeholder="Enter control key" /><div class="status" id="auth-status"></div></div></section>
      <section class="panel"><div class="panel-head"><div><div class="label">CURRENT STEP</div><div class="agent-head"><span class="ready-dot"></span><h2>1/17 Source Intake Agent</h2></div></div><span class="muted">READY</span></div><p class="agent-description">Nhận clip từ Drive, đọc metadata, kiểm tra source trên Mac và chuẩn hóa đầu vào.</p><div class="tabs"><button class="tab active" data-tab="overview">Overview</button><button class="tab" data-tab="input">Input</button><button class="tab" data-tab="output">Output JSON</button><button class="tab" data-tab="logs">Logs</button></div><div id="tab-overview"><div class="overview"><div><div class="section-title">INPUT SUMMARY</div><div class="facts"><div class="fact"><span>Clips selected</span><strong id="summary-count">0</strong></div><div class="fact"><span>Total duration</span><strong>Pending intake</strong></div><div class="fact"><span>Total size</span><strong id="summary-size">—</strong></div><div class="fact"><span>Drive source/folder</span><strong>Configured source</strong></div></div></div><div><div class="section-title">MACBOOK CHECK</div><div class="facts"><div class="fact"><span>Agent status</span><strong>Not connected</strong></div><div class="fact"><span>Drive Sync</span><strong>Awaiting Mac agent</strong></div><div class="fact"><span>Sources available locally</span><strong>Pending intake</strong></div><div class="fact"><span>Storage free</span><strong>—</strong></div></div></div></div></div><div id="tab-input" class="hidden muted">Selected Drive files are passed to Source Intake when the controller is connected.</div><div id="tab-output" class="hidden"><div class="json-title"><strong>STEP OUTPUT</strong><span>source_manifest.json</span></div><pre id="json-output"></pre></div><div id="tab-logs" class="hidden muted">No intake logs yet.</div><div class="json-title"><strong>STEP OUTPUT</strong><span>source_manifest.json</span></div><pre id="json-preview"></pre><div class="status" id="message"></div></section></div>
  </main>
  <aside class="rightbar"><section class="panel"><div class="panel-title">MACBOOK AGENT</div><div class="facts" style="margin-top:13px"><div class="fact"><span>Device name</span><strong>—</strong></div><div class="fact"><span>Status</span><strong>Not connected</strong></div><div class="fact"><span>Last heartbeat</span><strong>—</strong></div><div class="fact"><span>Drive Sync</span><strong>Awaiting agent</strong></div><div class="fact"><span>Source readiness</span><strong>Pending intake</strong></div></div></section><section class="panel"><div class="panel-title">PIPELINE SUMMARY</div><div class="metric-grid" style="margin-top:13px"><div class="metric">Total steps<strong>17</strong></div><div class="metric">Completed<strong>0</strong></div><div class="metric">In progress<strong class="green">1</strong></div><div class="metric">Pending<strong>16</strong></div><div class="metric">Failed<strong>0</strong></div><div class="metric">Progress %<strong>0%</strong></div></div></section><section class="panel"><div class="panel-title">STYLE PROFILE</div><div class="facts" style="margin-top:13px"><div class="fact"><span>Current QN style</span><strong>QN v1</strong></div><div class="fact"><span>Last updated</span><strong>—</strong></div></div><button class="btn" disabled style="width:100%;margin-top:14px">Manage Style Profile</button></section><section class="panel preview"><div class="label">NEXT STEP PREVIEW</div><span class="step-no">2/17</span><h3>Shot Detection Agent</h3><p>Tách source clip thành các shot/cảnh riêng biệt.</p><div class="json-title"><strong>STEP 2 OUTPUT</strong><span>shot_manifest.json</span></div><pre id="shot-output">{"status":"pending","input_step":"01_source_intake","input_job_id":null,"shots":[]}</pre><div class="json-title"><strong>STEP 3 OUTPUT</strong><span>quality_manifest.json</span></div><pre id="quality-output">{"status":"pending","input_step":"02_shot_detection","shots":[]}</pre></section></aside>
</div>
<script>
const CONFIG=__QN_GOOGLE_CONFIG__,SOURCE_FOLDER_ID=CONFIG.sourceFolderId||"",/* TEMPORARY TEST-ONLY LOCAL SYNC BYPASS */TEST_LOCAL_SYNC_BYPASS=true,$=id=>document.getElementById(id),selectedFiles=new Map();let accessToken=null,tokenClient=null,pickerReady=false;
const pipelineSteps=[['Source Intake Agent','active'],['Shot Detection Agent','pending'],['Quality Agent','pending'],['Visual Tag Agent','pending'],['Duplicate Agent','pending'],['Story Agent','pending'],['Shot Ranking Agent','pending'],['Sequence Agent','pending'],['Timing Agent','pending'],['Text / Audio Agent','pending'],['QN Style Judge','pending'],['Render Verification Agent','pending'],['Human Feedback Agent','pending'],['Publish Agent','pending'],['Performance Agent','pending'],['Pattern Learning Agent','pending'],['Style Memory Agent','pending']];let sourceIntakeJob=null;function createShotDetectionOutput(sourceManifest){return{status:"pending",input_step:sourceManifest.step,input_job_id:sourceManifest.job_id,shots:[]}}
function setDriveMessage(text,error=false){$("drive-message").textContent=text;$("drive-message").className="status"+(error?" error":"")}function hasOAuth(){return !!(window.google&&google.accounts&&google.accounts.oauth2)}function initializeGoogle(){if(!CONFIG.clientId||!CONFIG.apiKey||!CONFIG.appId||!SOURCE_FOLDER_ID)throw Error("Google Drive browser configuration is incomplete.");if(!hasOAuth())throw Error("Google Identity Services is unavailable.");if(!tokenClient)tokenClient=google.accounts.oauth2.initTokenClient({client_id:CONFIG.clientId,scope:"https://www.googleapis.com/auth/drive.file",callback:handleToken,error_callback:e=>setDriveMessage(e.error_description||e.error||"Google OAuth failed.",true)});return true}function initializeGoogleOnLoad(){try{initializeGoogle();setDriveMessage("Google Drive is ready to connect.")}catch(e){setDriveMessage(e.message,true)}}function initializePickerOnLoad(){try{if(!window.gapi)throw Error("Google Picker is unavailable.");gapi.load("picker",()=>{pickerReady=true})}catch(e){setDriveMessage(e.message,true)}}function handleGoogleLoadError(message){setDriveMessage(message,true)}
function connectGoogleDrive(){try{if(accessToken){accessToken=null;$("drive-connect").textContent="Connect Google Drive";$("select-files").disabled=true;$("drive-status").textContent="Not connected";setDriveMessage("Connect Google Drive to begin.");return}if(!tokenClient)throw Error("Google OAuth is not ready yet. Try again in a moment.");tokenClient.requestAccessToken({prompt:"consent"})}catch(e){setDriveMessage(e.message,true)}}function handleToken(response){if(response.error)return setDriveMessage(response.error_description||response.error,true);accessToken=response.access_token;$("drive-connect").textContent="Disconnect Google Drive";$("select-files").disabled=false;$("drive-status").textContent="Connected to Google Drive";setDriveMessage("Choose 2–10 video clips.")}
function openPicker(){try{if(!accessToken)throw Error("Connect Google Drive first.");if(!pickerReady||!window.google?.picker)return setDriveMessage("Google Picker is still loading. Try again in a moment.",true);const view=new google.picker.DocsView(google.picker.ViewId.DOCS).setIncludeFolders(true).setSelectFolderEnabled(false).setParent(SOURCE_FOLDER_ID).setMimeTypes("video/mp4,video/quicktime,video/webm,video/x-matroska");new google.picker.PickerBuilder().setAppId(CONFIG.appId).setDeveloperKey(CONFIG.apiKey).setOAuthToken(accessToken).addView(view).enableFeature(google.picker.Feature.MULTISELECT_ENABLED).setCallback(pickerCallback).build().setVisible(true)}catch(e){setDriveMessage(e.message,true)}}function pickerCallback(data){if(data.action===google.picker.Action.CANCEL)return setDriveMessage("File selection cancelled.");if(data.action===google.picker.Action.ERROR)return setDriveMessage("Google Picker returned an error. Reconnect and retry.",true);if(data.action!==google.picker.Action.PICKED)return;(data.docs||[]).forEach(file=>{if(selectedFiles.size>=10&&!selectedFiles.has(file.id))return;const name=file.name||"Untitled video",mimeType=file.mimeType||"video/mp4";selectedFiles.set(file.id,{id:file.id,name,mimeType,sizeBytes:file.sizeBytes||null})});renderFiles();createSourceIntakeJob();renderJson();$("shot-output").textContent=JSON.stringify(createShotDetectionOutput(manifest()),null,2);setDriveMessage(selectedFiles.size+" clip(s) selected.")}
function formatSize(bytes){if(!bytes)return"—";const units=["B","KB","MB","GB"];let n=Number(bytes),i=0;while(n>=1024&&i<3){n/=1024;i++}return n.toFixed(i?1:0)+" "+units[i]}function renderFiles(){const files=[...selectedFiles.values()];$("clip-count").textContent=files.length+" / 10";$("summary-count").textContent=files.length;$("summary-size").textContent=formatSize(files.reduce((sum,file)=>sum+(Number(file.sizeBytes)||0),0))||"—";$("start").disabled=files.length<2;$("selected-files").innerHTML=files.length?files.map(file=>'<div class="file"><div class="thumb">▶</div><div class="file-body"><div class="file-name">'+escapeHtml(file.name)+'</div><div class="file-meta">'+formatSize(file.sizeBytes)+'</div></div><button class="remove" data-file-id="'+escapeHtml(file.id)+'" aria-label="Remove '+escapeHtml(file.name)+'">×</button></div>').join(""):"<div class=\\\"muted\\\">No source clips selected.</div>";$("selected-files").querySelectorAll("[data-file-id]").forEach(button=>button.onclick=()=>{selectedFiles.delete(button.dataset.fileId);renderFiles();renderJson()})}function escapeHtml(value){return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]))}
function normalizeSource(file,index){return{source_id:"src_"+String(index+1).padStart(3,"0"),drive_file_id:file.id||null,drive_path:file.drivePath||null,filename:file.name||null,mime_type:file.mimeType||null,size_bytes:file.sizeBytes||null,duration_sec:file.durationSec||null,resolution:file.resolution||null,fps:file.fps||null,local_path:TEST_LOCAL_SYNC_BYPASS&&file.name?"/QN_RENDER_SOURCE/"+file.name:null,local_ready:TEST_LOCAL_SYNC_BYPASS&&!!file.name}}function validateSource(source){return !!(source.drive_file_id&&source.filename&&source.mime_type)}function createSourceIntakeJob(){if(!selectedFiles.size)return null;if(!sourceIntakeJob)sourceIntakeJob={job_id:crypto.randomUUID(),step:"01_source_intake",status:"active",sources:[]};sourceIntakeJob.sources=[...selectedFiles.values()].map(normalizeSource);sourceIntakeJob.status=sourceIntakeJob.sources.every(validateSource)&&sourceIntakeJob.sources.every(source=>source.local_ready)?"completed":"active";return sourceIntakeJob}function manifest(){const job=createSourceIntakeJob();return{job_id:job?job.job_id:null,step:"01_source_intake",clips:job?job.sources:[]}}function renderJson(){const value=JSON.stringify(manifest(),null,2);$("json-preview").textContent=value;$("json-output").textContent=value}async function startPipeline(){const sourceManifest=manifest();$("start").disabled=true;$("message").textContent="Creating test job...";$("message").className="status";try{const response=await fetch("/api/jobs",{method:"POST",headers:authHeaders(),body:JSON.stringify({source_manifest:sourceManifest})}),data=await response.json();if(!response.ok)throw new Error(data.error||"Could not create job.");$("message").textContent="Test job queued: "+data.job.job_id;$("message").className="status"}catch(e){$("message").textContent=e.message;$("message").className="status error"}finally{$("start").disabled=selectedFiles.size<2}}function authHeaders(){return{"content-type":"application/json","x-control-key":$("control-key").value.trim()}}$("control-key").oninput=async()=>{const status=$("auth-status");if(!$("control-key").value.trim()){status.textContent="";return}status.textContent="Checking control key...";try{const response=await fetch("/api/auth/check",{method:"POST",headers:authHeaders()}),data=await response.json();status.textContent=data.valid?"Control key valid":"Invalid control key";status.className="status"+(data.valid?"":" error")}catch(e){status.textContent=e.message;status.className="status error"}};
$("drive-connect").onclick=connectGoogleDrive;$("select-files").onclick=openPicker;let activeJobId=null;async function pollActiveJob(jobId){for(let attempt=0;attempt<120;attempt++){if(activeJobId!==jobId)return;const response=await fetch("/api/jobs/"+encodeURIComponent(jobId),{headers:{"x-control-key":$("control-key").value.trim()}});const data=await response.json();if(!response.ok)throw new Error(data.error||"Could not read job status.");if(data.job?.job_id!==activeJobId)return;document.dispatchEvent(new CustomEvent("qn:job-response",{detail:data.job}));$("message").textContent="Job status: "+(data.job.status||"unknown");if(data.job.shot_manifest?.shots?.length){$("shot-output").textContent=JSON.stringify(data.job.shot_manifest,null,2);const steps=document.querySelectorAll("#steps .step");steps[0].className="step completed";steps[1].className="step completed";const metrics=document.querySelectorAll(".metric strong");metrics[1].textContent="2";metrics[2].textContent="1";metrics[3].textContent="14";metrics[5].textContent="12%";document.querySelector(".agent-head h2").textContent="3/17 Quality Agent";document.querySelector(".agent-description").textContent="Quality Agent pending.";$("message").textContent="Step 2 completed for "+activeJobId}if(data.job.status==="failed")throw new Error(data.job.error||"Job failed.");await new Promise(resolve=>setTimeout(resolve,1000))}}async function startPipeline(){const sourceManifest=manifest();$("start").disabled=true;$("message").textContent="Creating job...";$("message").className="status";try{const response=await fetch("/api/jobs",{method:"POST",headers:authHeaders(),body:JSON.stringify({source_manifest:sourceManifest})}),data=await response.json();if(!response.ok)throw new Error(data.error||"Could not create job.");activeJobId=data.job.job_id;$("steps").querySelectorAll(".step")[0].className="step completed";$("message").textContent="Step 1 completed. Job: "+activeJobId;await pollActiveJob(activeJobId)}catch(e){$("message").textContent=e.message;$("message").className="status error"}finally{$("start").disabled=selectedFiles.size<2}}$("start").onclick=startPipeline;document.querySelectorAll(".tab").forEach(tab=>tab.onclick=()=>{document.querySelectorAll(".tab").forEach(item=>item.classList.toggle("active",item===tab));document.querySelectorAll("[id^=tab-]").forEach(panel=>panel.classList.toggle("hidden",panel.id!=="tab-"+tab.dataset.tab))});$("steps").innerHTML=pipelineSteps.map((step,index)=>'<div class="step '+step[1]+'"><div class="step-line"></div><div class="step-name"><span class="step-no">'+(index+1)+"</span>"+step[0]+"</div></div>").join("");renderFiles();renderJson();
</script>
<style>
/* Visual layer. Pipeline bindings and operation handlers remain unchanged. */
:root{--studio-bg:#11120f;--studio-text:#edece4;--studio-muted:#94978c;--studio-lime:#c4db80;--studio-line:#33362d}
body{background:var(--studio-bg);color:var(--studio-text);font:16px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
button,input{font:inherit}
[hidden]{display:none!important}
.operator-header{height:104px;margin:0 auto;max-width:1600px;padding:0 5vw;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:32px}
.operator-brand{font-size:18px;font-weight:650;letter-spacing:.17em;white-space:nowrap}
.operator-brand span{font-weight:350;color:var(--studio-muted);letter-spacing:.22em;margin-left:12px}
.operator-nav{display:flex;gap:36px;align-items:center;height:100%}
.operator-nav button,.operator-link{background:none;border:0;color:var(--studio-muted);font:inherit;cursor:pointer;padding:12px 0}
.operator-nav button{position:relative;font-size:14px}
.operator-nav button[aria-current=page]{color:var(--studio-text)}
.operator-nav button[aria-current=page]:after{content:"";position:absolute;bottom:2px;left:0;right:0;height:2px;background:var(--studio-lime)}
.operator-header>.operator-link{justify-self:end;font-size:14px}
.operator-link:hover,.operator-nav button:hover{color:var(--studio-text)}
.operator-view{max-width:1440px;margin:0 auto;padding:64px 5vw 70px}
.operator-view h1{font:400 clamp(42px,5.3vw,78px)/1.03 Georgia,"Times New Roman",serif;letter-spacing:-.045em;margin:0 0 26px}
.operator-view p{color:var(--studio-muted);font-size:16px;line-height:1.7}
.operator-view .btn{border:1px solid #4d5143;border-radius:4px;background:transparent;color:var(--studio-text);font-size:15px;line-height:1.4;padding:13px 20px;font-weight:500;transition:background .16s,border-color .16s,transform .16s}
.operator-view .btn:hover{background:#2a2e23;border-color:#7a8366}
.operator-view .btn:active{transform:translateY(1px)}
.operator-view .btn.primary{color:#19200e;background:var(--studio-lime);border-color:var(--studio-lime);font-weight:650}
.operator-view .btn.primary:hover{background:#d3e6a1}
.operator-view .btn:disabled{opacity:1;background:#24271e;border-color:#30342a;color:#787d6a;cursor:not-allowed}
button:focus-visible,input:focus-visible{outline:2px solid var(--studio-lime);outline-offset:5px}
#operator-setup{display:grid;grid-template-columns:minmax(260px,.85fr) minmax(360px,1.2fr);gap:0 7vw;align-items:start;min-height:600px;padding-top:36px}
.operator-intro{grid-column:1;grid-row:1 / span 2;padding:24px 0 0}
.operator-intro h1 em{font-weight:400;color:#b3b9a4}
.operator-intro>p{max-width:300px;margin:0}
.operator-edition{margin-bottom:30px!important;font-size:14px!important;color:#c3c7b7!important}
#operator-connections{margin-top:54px;max-width:340px;display:flex;align-items:flex-start;flex-direction:column;gap:9px}
#operator-connections .drive-state{font-size:14px;font-weight:400;color:var(--studio-muted);margin:0}
#operator-connections .btn{font-size:14px;border-color:#45493c;padding:10px 16px}
#operator-connections .status{font-size:13px;line-height:1.55;min-height:0;margin:0;color:var(--studio-muted)}
#operator-connections .status.error{color:#eca297}
#operator-sources{grid-column:2;grid-row:1;min-width:0}
#operator-start{grid-column:2;display:flex;justify-content:flex-end;margin-top:22px}
#operator-start .btn{min-width:190px;padding:17px 26px;font-size:16px;display:flex;align-items:center;justify-content:space-between;gap:32px}
#operator-start .btn:after{content:"↗";font-size:22px;line-height:1}
.operator-view .source-panel{border:0;border-radius:0;padding:0;background:transparent;margin:0;display:flex;flex-direction:column}
.operator-view .source-panel>.panel-head{order:0;align-items:center;margin:0 0 18px;padding:0}
.operator-view .panel-title{font:500 16px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;letter-spacing:0}
.operator-view #clip-count{font-size:14px;color:var(--studio-muted);font-variant-numeric:tabular-nums}
.operator-view .source-panel .drive-actions{order:2;display:flex;justify-content:flex-end;margin:0;padding:16px 22px;background:#1b1e17;border-top:1px solid #30352a}
.operator-view #select-files{width:auto;border:0;padding:4px 0;font-size:15px;color:var(--studio-lime);background:none}
.operator-view #select-files:disabled{color:#72786a;cursor:not-allowed}
.operator-view #selected-files{order:1;background:#1b1e17;min-height:300px;max-height:480px;overflow-y:auto;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;padding:22px;border-radius:3px 3px 0 0;counter-reset:footage}
.operator-view #selected-files:has(>.muted){display:flex;align-items:center;justify-content:center;min-height:330px;padding:45px}
.operator-view #selected-files>.muted{text-align:center;font-size:16px;color:#adb2a1;max-width:280px;line-height:1.65}
.operator-view #selected-files>.muted:before{content:"＋";display:block;font-size:36px;font-weight:200;color:#a8b78c;margin:0 auto 22px;width:62px;height:62px;line-height:58px;border:1px solid #454d3a;border-radius:50%}
.operator-view .file{display:grid;grid-template-columns:1fr auto;gap:10px;align-content:start;align-items:center;border:0;border-radius:2px;background:#282d22;padding:16px;position:relative;counter-increment:footage;min-width:0}
.operator-view .thumb{display:flex;grid-column:1 / -1;align-items:center;justify-content:space-between;width:100%;height:70px;background:none;color:#626c55;font-size:20px;border-radius:0}
.operator-view .thumb:before{content:counter(footage,decimal-leading-zero);font:italic 40px Georgia,serif;color:#929e7e}
.operator-view .file-body{min-width:0}
.operator-view .file-name{font-size:14px;font-weight:500;color:#e2e6d8}
.operator-view .file-meta{font-size:12px;color:#929a87;margin-top:5px}
.operator-view .remove{color:#a0aa92;width:28px;height:32px;padding:0;font-size:22px}
.operator-view .remove:hover{color:#efb2a7}
.operator-view .source-panel .auth{order:3;padding:22px 0 0;display:grid;grid-template-columns:1fr;gap:8px;margin:0}
.operator-view .auth .label{font-size:14px;letter-spacing:0;color:#b2b8a5;font-weight:400}
.operator-view .auth input{font-size:16px;color:var(--studio-text);width:100%;padding:12px 0;background:transparent;border:0;border-bottom:1px solid #4b5141;border-radius:0;margin:0}
.operator-view .auth .status{font-size:13px;min-height:0}
.operator-status{color:#a8b58d!important;font-size:13px!important;overflow-wrap:anywhere}
.operator-view .source-panel>.operator-status{order:3;margin:18px 0 0;text-align:left}
.operator-view .source-panel>.operator-status:before{content:"✓";margin-right:9px}
#operator-processing{max-width:940px;min-height:650px;margin:0 auto;text-align:center;padding:55px 0 0;display:flex;flex-direction:column;align-items:center}
.operator-state-caption{font-size:14px!important;letter-spacing:.03em;margin:0 0 34px!important}
#operator-activity{max-width:900px;font-size:clamp(42px,6.3vw,88px);line-height:1.02;margin:0 auto 20px}
#operator-explanation{order:3;max-width:480px;font-size:16px;margin:28px auto 0}
.operator-progress-stage{order:2;width:min(100%,530px);margin:20px auto 0}
#operator-progress-number{font:300 clamp(60px,9vw,116px)/1.1 Georgia,serif;letter-spacing:-.06em;color:var(--studio-lime);display:block;margin:0 0 32px}
#operator-progress{display:block;width:100%;height:2px;accent-color:var(--studio-lime);border:0;background:#333a28}
#operator-progress::-webkit-progress-bar{background:#333a28}
#operator-progress::-webkit-progress-value{background:var(--studio-lime);transition:width .3s ease}
#operator-progress::-moz-progress-bar{background:var(--studio-lime)}
.operator-progress-stage:has(#operator-progress:not([value]):not([hidden])):before{content:"";display:block;width:7px;height:7px;background:var(--studio-lime);border-radius:50%;margin:32px auto;animation:studio-breathe 2.4s ease-in-out infinite}
.operator-progress-stage:has(#operator-progress:not([value])) #operator-progress{visibility:hidden}
.operator-progress-stage:has(#operator-progress[hidden]){display:none}
.operator-state-actions{order:4;display:flex;align-items:center;justify-content:center;gap:24px;margin:30px 0 0}
.operator-state-actions .operator-link{font-size:14px}
#operator-job{order:5;font-size:12px!important;color:#656c5b!important;margin-top:60px;max-width:100%}
#operator-processing:has(#operator-new-reel:not([hidden])) .operator-state-caption{color:var(--studio-lime)}
#operator-diagnostics{max-width:1500px;padding-top:36px}
#operator-diagnostics h1{font:500 30px/1.2 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;letter-spacing:-.02em;margin-bottom:12px}
#operator-diagnostics h2{font-size:16px}
#operator-diagnostics>p{font-size:14px;margin-bottom:28px}
#operator-diagnostics .app{display:grid;grid-template-columns:minmax(0,1fr) 280px;min-height:0}
#operator-diagnostics .main{padding:0 24px 0 0}
#operator-diagnostics .workspace{display:block}
#operator-diagnostics .steps{grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px}
#operator-diagnostics .step-name{white-space:normal;font-size:14px}
#operator-diagnostics .rightbar{padding:0 0 0 20px}
#operator-diagnostics pre{font-size:13px}
.operator-log{white-space:pre-wrap;overflow-wrap:anywhere;background:#141a16;padding:20px;font:13px/1.6 ui-monospace,monospace;margin-bottom:28px}
#operator-settings{max-width:780px;padding-top:70px}
#operator-settings h2{font-size:18px;font-weight:500;margin-top:36px}
#operator-settings .auth{padding:20px 0;max-width:480px}
@keyframes studio-breathe{0%,100%{opacity:.3}50%{opacity:1}}
@media(min-width:751px) and (max-height:850px){#operator-production{padding-top:22px}#operator-setup{padding-top:0;min-height:0}.operator-view #selected-files{min-height:220px;max-height:280px}.operator-view #selected-files:has(>.muted){min-height:230px;padding:28px}.operator-intro{padding-top:12px}#operator-connections{margin-top:32px}}
@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
@media(max-width:950px){.operator-view{padding-top:36px}#operator-setup{gap:0 5vw;grid-template-columns:minmax(230px,.8fr) minmax(320px,1.1fr)}.operator-header{padding:0 5vw}.operator-nav{gap:22px}.operator-brand span{display:block;margin:2px 0 0;font-size:12px}.operator-view #selected-files{padding:16px;gap:10px}.operator-view .file{padding:12px}}
@media(max-width:750px){.operator-header{height:auto;min-height:105px;grid-template-columns:1fr auto;gap:18px;padding:24px}.operator-nav{grid-column:1;grid-row:2;gap:28px}.operator-header>.operator-link{grid-column:2;grid-row:1 / span 2}.operator-brand span{display:inline;margin-left:10px;font-size:16px}.operator-view{padding:26px 24px 50px}#operator-setup{display:flex;flex-direction:column;gap:0;padding-top:12px;min-height:0}.operator-intro{padding:0;width:100%}.operator-intro h1{max-width:540px;font-size:54px;margin-bottom:18px}.operator-edition{margin-bottom:20px!important}#operator-connections{margin:26px 0 34px;max-width:100%}#operator-sources{width:100%}#operator-start{width:100%;margin-top:22px}.operator-view #selected-files:has(>.muted){min-height:240px}.operator-view #selected-files{min-height:230px}.operator-view #selected-files>.muted:before{margin-bottom:14px}#operator-processing{padding-top:50px;min-height:560px}#operator-activity{font-size:52px}#operator-progress-number{font-size:90px}#operator-diagnostics .app{display:block}#operator-diagnostics .main{padding:0}#operator-diagnostics .rightbar{display:block;padding:20px 0;border:0}}
@media(max-width:390px){.operator-header,.operator-view{padding-left:18px;padding-right:18px}.operator-intro h1{font-size:45px}.operator-view #selected-files{grid-template-columns:1fr}.operator-state-actions{flex-direction:column;gap:10px}}
</style>
<script>
(function mountOperatorConsole(){
  const app=document.querySelector(".app");
  const sourcePanel=document.querySelector(".source-panel");
  const startButton=$("start");
  const header=document.createElement("header");
  header.className="operator-header";
  header.innerHTML='<div class="operator-brand">QN <span>ASTRA</span></div><nav class="operator-nav" aria-label="Main navigation"><button data-view="production" aria-current="page">Production</button><button data-view="diagnostics">Diagnostics</button></nav><button class="operator-link" data-view="settings">Settings</button>';
  document.body.insertBefore(header,app);
  const views={};
  function makeView(name,content){
    const view=document.createElement("section");
    view.id="operator-"+name;view.className="operator-view";view.hidden=name!=="production";
    view.innerHTML=content;document.body.insertBefore(view,app);views[name]=view;return view;
  }
  const production=makeView("production",'<div id="operator-setup"><div class="operator-intro"><p class="operator-edition">A new production</p><h1>Your footage.<br><em>A new story.</em></h1><p>Create a reel from the moments you captured.</p><div id="operator-connections"></div></div><div id="operator-sources"></div><div id="operator-start"></div></div><div id="operator-processing" class="operator-state" hidden aria-live="polite"><p class="operator-state-caption">Your production</p><p id="operator-job" class="operator-status"></p><h1 id="operator-activity">Preparing footage</h1><div class="operator-progress-stage"><output id="operator-progress-number" aria-hidden="true" hidden></output><progress id="operator-progress" aria-label="Reported job progress"></progress></div><p id="operator-explanation"></p><div class="operator-state-actions"><button class="operator-link" data-open="diagnostics">View diagnostics</button><button class="btn" id="operator-new-reel" hidden>Start another reel</button></div></div>');
  const diagnostics=makeView("diagnostics",'<h1>Diagnostics</h1><p>Pipeline details and source identities for the current page. Runtime heartbeat data is not available.</p><h2>Job response</h2><pre class="operator-log" id="operator-job-json">No job response yet.</pre><div id="operator-pipeline"></div>');
  const settings=makeView("settings",'<h1>Connections</h1><p id="operator-connection">Google Drive is not connected.</p><button class="btn" id="operator-disconnect" hidden>Disconnect Google Drive</button><h2>Control key</h2><p>The key stays in the current page. Reloading requires entering it again.</p><button class="btn" id="operator-edit-key">Edit control key</button><h2>Availability</h2><p>Final video review, approval, and publishing are not connected in this version.</p>');
  $("operator-sources").appendChild(sourcePanel);
  $("operator-start").appendChild(startButton);
  startButton.textContent="Create reel";
  $("select-files").textContent="Select source clips";
  sourcePanel.querySelector(".panel-title").textContent="Your footage";
  // Reposition the same connection controls; their handlers and state stay intact.
  $("operator-connections").append($("drive-status"),$("drive-connect"),$("drive-message"));
  app.querySelector(".sidebar").remove();
  app.querySelector(".topbar").remove();
  $("operator-pipeline").appendChild(app);
  // The panels and their IDs are retained so original polling and inspection keep working.
  diagnostics.querySelectorAll(".fact strong").forEach(el=>{
    if(["Not connected","Awaiting agent","Awaiting Mac agent"].includes(el.textContent))el.textContent="Not reported";
  });
  const authInput=$("control-key");
  const authContainer=authInput.closest(".auth");
  const keyReady=document.createElement("p");
  keyReady.className="operator-status";keyReady.hidden=true;keyReady.textContent="Control key ready";
  authContainer.after(keyReady);
  let submitted=false,latestJob=null,settled=false,requestFailed=false;
  const initialSteps=Array.from(document.querySelectorAll("#steps .step"),el=>el.className);
  const initialMetrics=Array.from(document.querySelectorAll(".metric strong"),el=>el.textContent);
  const initialHeading=document.querySelector(".agent-head h2").textContent;
  const initialDescription=document.querySelector(".agent-description").textContent;
  function showView(name){
    Object.entries(views).forEach(([key,el])=>{el.hidden=key!==name});
    header.querySelectorAll("[data-view]").forEach(button=>{
      if(button.dataset.view===name)button.setAttribute("aria-current","page");else button.removeAttribute("aria-current");
    });
  }
  header.querySelectorAll("[data-view]").forEach(button=>button.onclick=()=>showView(button.dataset.view));
  document.querySelectorAll("[data-open]").forEach(button=>button.onclick=()=>showView(button.dataset.open));
  $("operator-edit-key").onclick=()=>{
    if(submitted){settings.appendChild(authContainer)}else{$("operator-sources").appendChild(authContainer);showView("production")}
    authContainer.hidden=false;keyReady.hidden=true;authInput.focus();
  };
  $("operator-disconnect").onclick=()=>{$("drive-connect").click();refreshConnections()};
  function refreshConnections(){
    const connected=!!accessToken;
    $("drive-connect").hidden=connected;
    $("operator-disconnect").hidden=!connected;
    $("operator-connection").textContent=connected?"Google Drive connected.":"Google Drive is not connected.";
    // Keep OAuth errors visible, but collapse successful setup details.
    $("drive-message").hidden=connected&&!$("drive-message").classList.contains("error");
    const valid=$("auth-status").textContent==="Control key valid";
    authContainer.hidden=valid;keyReady.hidden=!valid;
  }
  new MutationObserver(refreshConnections).observe($("drive-status"),{childList:true,subtree:true});
  new MutationObserver(refreshConnections).observe($("auth-status"),{childList:true,subtree:true});
  new MutationObserver(()=>{if(!submitted)refreshConnections()}).observe($("selected-files"),{childList:true});
  // Presentation-only enhancements read the existing controls, never the network.
  function refreshMediaPresentation(){
    const empty=$("selected-files").querySelector(":scope > .muted");
    if(empty&&empty.textContent!=="Select 2–10 clips from Google Drive to begin.")empty.textContent="Select 2–10 clips from Google Drive to begin.";
  }
  new MutationObserver(refreshMediaPresentation).observe($("selected-files"),{childList:true});
  refreshMediaPresentation();
  function refreshProgressPresentation(){
    const progress=$("operator-progress"),number=$("operator-progress-number");
    number.hidden=progress.hidden||!progress.hasAttribute("value");
    number.textContent=number.hidden?"":Math.round(progress.value)+"%";
  }
  new MutationObserver(refreshProgressPresentation).observe($("operator-progress"),{attributes:true,attributeFilter:["hidden","value","max"]});
  // Wrap the existing handler; it remains the sole owner of requests and polling.
  const existingStart=startButton.onclick;
  startButton.onclick=async function(event){
    submitted=true;settled=false;requestFailed=false;latestJob=null;
    $("operator-setup").hidden=true;$("operator-processing").hidden=false;
    renderOperatorState();showView("production");
    try{await existingStart.call(this,event)}
    finally{settled=true;requestFailed=$("message").classList.contains("error");renderOperatorState()}
  };
  // A read-only observer of the response already fetched by the pipeline.
  // Keep this hook when integrating newer polling code; do not replace its handling.
  document.addEventListener("qn:job-response",event=>{
    const job=event.detail;
    if(!submitted||!job||job.job_id!==activeJobId)return;
    latestJob=job;$("operator-job-json").textContent=JSON.stringify(job,null,2);
    renderOperatorState();
  });
  function operatorPhase(job){
    const status=String(job?.status||"").toLowerCase();
    if(requestFailed||status==="failed"||status==="error")return ["Something needs attention.","Open Diagnostics for details. Automatic retry is not available."];
    if(status==="published")return ["Published","The job reports that publishing is complete."];
    if(status==="approved")return ["Approved","Inspect the job in Diagnostics. Publishing controls are not connected here."];
    if(status==="completed"||status==="complete")return ["Processing complete","Inspect the result in Diagnostics. Review controls are not connected here."];
    const step=Number.parseInt(String(job?.step||""),10);
    // Prefer an explicit later step to old manifests retained on the same job.
    if(status==="rendering"||step===12)return ["Rendering final video","Waiting for rendering and verification to finish."];
    if(step>=13)return ["Finishing up","See Diagnostics for the current checkpoint."];
    if(step>=8)return ["Creating the reel","The plan is being prepared."];
    if(step>=6)return ["Building the story","The footage is being shaped into a story."];
    if(step>=3)return ["Analyzing footage","Waiting for the next pipeline update."];
    if(status==="ready")return ["Ready for the next stage","Processing has paused at the current checkpoint. See Diagnostics for details."];
    if(job?.shot_manifest?.shots?.length||step===2)return ["Analyzing footage","Waiting for the next pipeline update."];
    if(["queued","claimed","downloading"].includes(status)||!job)return ["Preparing footage","Your source clips are being prepared."];
    return ["Processing footage","Waiting for the next pipeline update. See Diagnostics for details."];
  }
  function renderOperatorState(){
    if(!submitted)return;
    const [title,description]=operatorPhase(latestJob);
    $("operator-job").textContent=activeJobId?"Reel "+activeJobId:"";
    $("operator-activity").textContent=title;$("operator-explanation").textContent=description;
    const progress=$("operator-progress"),value=latestJob?.progress;
    progress.hidden=settled||requestFailed||["failed","error","ready","completed","complete","approved","published"].includes(latestJob?.status);
    if(typeof value==="number"&&Number.isFinite(value)){progress.max=100;progress.value=Math.max(0,Math.min(100,value))}else progress.removeAttribute("value");
    // Do not abandon active work merely because the current poll loop timed out.
    const terminal=["failed","error","completed","complete","published"].includes(latestJob?.status);
    const paused=latestJob?.status==="ready";
    $("operator-new-reel").hidden=!settled||!(terminal||paused||(requestFailed&&!activeJobId));
  }
  $("operator-new-reel").onclick=()=>{
    if($("operator-new-reel").hidden)return;
    activeJobId=null;sourceIntakeJob=null;selectedFiles.clear();
    submitted=false;settled=false;requestFailed=false;latestJob=null;
    sourcePanel.appendChild(authContainer);authContainer.after(keyReady);
    renderFiles();renderJson();
    $("shot-output").textContent=JSON.stringify(createShotDetectionOutput(manifest()),null,2);
    $("operator-job-json").textContent="No job response yet.";
    $("message").textContent="";$("message").className="status";
    document.querySelectorAll("#steps .step").forEach((el,i)=>{el.className=initialSteps[i]});
    document.querySelectorAll(".metric strong").forEach((el,i)=>{el.textContent=initialMetrics[i]});
    document.querySelector(".agent-head h2").textContent=initialHeading;
    document.querySelector(".agent-description").textContent=initialDescription;
    $("operator-setup").hidden=false;$("operator-processing").hidden=true;
    refreshConnections();showView("production");$("select-files").focus();
  };
  refreshConnections();
})();
</script>
<script src="https://accounts.google.com/gsi/client" async defer onload="initializeGoogleOnLoad()" onerror="handleGoogleLoadError('Google Identity Services failed to load.')"></script><script src="https://apis.google.com/js/api.js" async defer onload="initializePickerOnLoad()" onerror="handleGoogleLoadError('Google Picker failed to load.')"></script></body></html>`;

 function json(data, status = 200) { return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8" } }); }
function authorized(request, env) { const expected = env.CONTROL_KEY || ""; return !expected || request.headers.get("x-control-key") === expected; }
function renderHtml(env) { const config = JSON.stringify({ clientId: env.GOOGLE_CLIENT_ID || "", apiKey: env.GOOGLE_API_KEY || "", appId: env.GOOGLE_APP_ID || "", sourceFolderId: env.GOOGLE_SOURCE_FOLDER_ID || "" }).replace(/</g, "\\u003c"); return PIPELINE_HTML.replace("__QN_GOOGLE_CONFIG__", config); }
function parseGeminiJson(text) { const cleaned = String(text || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim(); const parsed = JSON.parse(cleaned); if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Gemini returned a JSON object was expected."); return parsed; }
async function uploadGeminiFile(stream, contentLength, file, env) {
  const start = await fetch("https://generativelanguage.googleapis.com/upload/v1beta/files?key=" + encodeURIComponent(env.GEMINI_API_KEY), { method: "POST", headers: { "X-Goog-Upload-Protocol": "resumable", "X-Goog-Upload-Command": "start", "X-Goog-Upload-Header-Content-Length": String(contentLength), "X-Goog-Upload-Header-Content-Type": file.mimeType, "content-type": "application/json" }, body: JSON.stringify({ file: { display_name: file.name } }) });
  const uploadUrl = start.headers.get("x-goog-upload-url");
  if (!start.ok) {
    const responseBody = await start.text();
    const diagnostics = { status: start.status, responseBody, uploadUrlReturned: !!uploadUrl };
    console.error("Gemini upload start failed", diagnostics);
    throw new Error("Gemini upload start failed for " + file.name + " (HTTP " + start.status + "; x-goog-upload-url returned: " + (uploadUrl ? "yes" : "no") + "): " + responseBody);
  }
  if (!uploadUrl) throw new Error("Gemini did not return an upload URL for " + file.name + ".");
  const upload = await fetch(uploadUrl, { method: "POST", headers: { "Content-Length": String(contentLength), "X-Goog-Upload-Offset": "0", "X-Goog-Upload-Command": "upload, finalize" }, body: stream });
  if (!upload.ok) throw new Error("Gemini file upload failed for " + file.name + ".");
  const uploaded = await upload.json();
  const fileResource = uploaded.file;
  if (!fileResource?.name) throw new Error("Gemini returned no file resource for " + file.name + ".");
  for (let attempt = 0; attempt < 30; attempt++) {
    if (fileResource.state === "ACTIVE") return fileResource;
    if (fileResource.state === "FAILED") throw new Error("Gemini could not process " + file.name + ".");
    await new Promise(resolve => setTimeout(resolve, 2000));
    const status = await fetch("https://generativelanguage.googleapis.com/v1beta/" + fileResource.name + "?key=" + encodeURIComponent(env.GEMINI_API_KEY));
    if (!status.ok) throw new Error("Could not check Gemini processing status for " + file.name + ".");
    Object.assign(fileResource, await status.json());
  }
  throw new Error("Gemini timed out while processing " + file.name + ".");
}

async function generateGeminiJson(parts, env, invalidMessage) {
  if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured on the Worker.");
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(env.GEMINI_MODEL || "gemini-3.7-flash") + ":generateContent?key=" + encodeURIComponent(env.GEMINI_API_KEY), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ contents: [{ role: "user", parts }], generationConfig: { responseMimeType: "application/json" } }) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "Gemini analysis failed.");
  const text = (data.candidates?.[0]?.content?.parts || []).map(part => part.text || "").join("");
  try { return parseGeminiJson(text); } catch (error) { console.error("Gemini returned invalid JSON", { responseText: text.slice(0, 20000), error: String(error) }); throw new Error(invalidMessage); }
}

async function analyze(fileIds, driveAccessToken, env) {
  const files = [];
  for (const id of fileIds) {
    const metadataResponse = await fetch("https://www.googleapis.com/drive/v3/files/" + encodeURIComponent(id) + "?fields=id,name,mimeType,size&supportsAllDrives=true", { headers: { Authorization: "Bearer " + driveAccessToken } });
    if (!metadataResponse.ok) throw new Error("Could not read selected video metadata from Google Drive.");
    const file = await metadataResponse.json();
    if (!file.name || !file.mimeType || !VIDEO_MIME_TYPES.has(file.mimeType)) throw new Error("Selected Drive file is not a supported video.");
    const contentLength = Number(file.size);
    if (!Number.isFinite(contentLength) || contentLength < 1) throw new Error("Could not determine the selected video size.");
    const response = await fetch("https://www.googleapis.com/drive/v3/files/" + encodeURIComponent(id) + "?alt=media", { headers: { Authorization: "Bearer " + driveAccessToken } });
    if (!response.ok) throw new Error("Could not download " + file.name + " from Google Drive.");
    if (!response.body) throw new Error("Google Drive did not return a video stream for " + file.name + ".");
    files.push({ ...file, geminiFile: await uploadGeminiFile(response.body, contentLength, file, env) });
  }
  const parts = [{ text: QN_VIDEO_INSTRUCTIONS + "\n\nReturn an object with these fields where applicable: concept, target duration, ordered timeline, source filename, start/end trim, reason, transition, optional text, rejected clips with reasons, and overall reasoning. Source files: " + files.map(file => file.name).join(", ") }];
  files.forEach(file => parts.push({ fileData: { mimeType: file.geminiFile.mimeType, fileUri: file.geminiFile.uri } }));
  return generateGeminiJson(parts, env, "Gemini returned invalid edit-plan JSON.");
}

function normalizeStoryResult(result) {
  if (!result || typeof result !== "object" || Array.isArray(result)) throw new Error("Gemini story result must be an object.");
  return {
    status: result.status || "completed",
    story_goal: result.story_goal ?? null,
    story_theme: result.story_theme ?? null,
    story_arc: {
      opening: result.story_arc?.opening ?? null,
      development: result.story_arc?.development ?? null,
      ending: result.story_arc?.ending ?? null
    },
    tone: result.tone ?? null
  };
}

function validateStoryInput(manifests) {
  for (const [name, manifest] of Object.entries(manifests)) {
    if (!manifest || typeof manifest !== "object" || !Array.isArray(manifest.shots)) throw new Error(`${name} manifest is required for Step 6.`);
    if (name !== "shot_manifest" && manifest.status !== "completed") throw new Error(`${name} manifest is not completed for Step 6.`);
  }
}

async function analyzeStory(manifests, env) {
  validateStoryInput(manifests);
  const prompt = "Use only these completed Step 2-5 pipeline manifests to create the story. Return JSON only with exactly these fields: status, story_goal, story_theme, story_arc (object with opening, development, ending), and tone. Do not invent unavailable footage details. Pipeline manifests:\n" + JSON.stringify(manifests);
  const result = await generateGeminiJson([{ text: prompt }], env, "Gemini returned invalid story JSON.");
  return normalizeStoryResult(result);
}

function normalizeRankingManifest(result, shotManifest) {
  if (!result || typeof result !== "object" || !Array.isArray(result.shots)) throw new Error("Gemini ranking result must contain a shots array.");
  result = result.shots;
  const expected = shotManifest.shots.map(shot => `${shot.shot_id}\u0000${shot.source_id}`);
  if (new Set(expected).size !== expected.length) throw new Error("Step 2 contains duplicate shot identities.");
  if (result.length !== expected.length) throw new Error("Gemini ranking result must contain exactly one result per Step 2 shot.");
  const expectedByKey = new Map(shotManifest.shots.map(shot => [`${shot.shot_id}\u0000${shot.source_id}`, shot]));
  const resultsByKey = new Map();
  for (const [index, item] of result.entries()) {
    if (!item || typeof item !== "object" || Array.isArray(item)) throw new Error(`Ranking result at index ${index} is not an object.`);
    if (typeof item.shot_id !== "string" || typeof item.source_id !== "string") throw new Error(`Ranking result at index ${index} is missing its identity.`);
    const key = `${item.shot_id}\u0000${item.source_id}`;
    if (!expectedByKey.has(key)) throw new Error(`Ranking result at index ${index} has an unknown shot identity.`);
    if (resultsByKey.has(key)) throw new Error(`Ranking result at index ${index} duplicates a shot identity.`);
    for (const field of ["story_relevance_score", "visual_strength_score", "ranking_score"]) {
      if (typeof item[field] !== "number" || !Number.isFinite(item[field])) throw new Error(`Ranking result at index ${index} has an invalid ${field}.`);
    }
    if (typeof item.ranking_status !== "string" || !item.ranking_status.trim()) throw new Error(`Ranking result at index ${index} has an invalid ranking_status.`);
    resultsByKey.set(key, item);
  }
  for (const item of result) {
    const duplicateKey = `${item.shot_id}\u0000${item.source_id}`;
    const duplicateShot = expectedByKey.get(duplicateKey);
    const duplicateOf = duplicateManifestShot(shotManifest, duplicateShot);
    if (!duplicateOf || duplicateOf === duplicateShot.shot_id) continue;
    const canonicalShot = shotManifest.shots.find(shot => shot.shot_id === duplicateOf);
    const canonicalResult = canonicalShot && resultsByKey.get(`${canonicalShot.shot_id}\u0000${canonicalShot.source_id}`);
    if (!canonicalResult || item.ranking_score <= canonicalResult.ranking_score) continue;
    const hasMetadataReason = item.story_relevance_score > canonicalResult.story_relevance_score || item.visual_strength_score > canonicalResult.visual_strength_score;
    if (!hasMetadataReason) throw new Error(`Duplicate shot ${item.shot_id} outranks its canonical equivalent without a metadata reason.`);
  }
  return {
    status: "completed",
    input_step: "02_shot_detection",
    input_job_id: shotManifest.input_job_id || null,
    shots: result.map(item => ({
      shot_id: item.shot_id,
      source_id: item.source_id,
      story_relevance_score: item.story_relevance_score,
      visual_strength_score: item.visual_strength_score,
      ranking_score: item.ranking_score,
      ranking_status: item.ranking_status
    }))
  };
}

function duplicateManifestShot(shotManifest, shot) {
  return shotManifest._duplicate_manifest?.shots?.find(item => item.shot_id === shot.shot_id)?.duplicate_of_shot_id || null;
}

async function analyzeRanking(manifests, env) {
  const { shot_manifest: shotManifest, story_manifest: storyManifest, duplicate_manifest: duplicateManifest } = manifests;
  for (const [name, manifest] of Object.entries({
    shot_manifest: shotManifest,
    quality_manifest: manifests.quality_manifest,
    visual_tag_manifest: manifests.visual_tag_manifest,
    duplicate_manifest: duplicateManifest
  })) {
    if (!manifest || typeof manifest !== "object" || !Array.isArray(manifest.shots)) throw new Error(`${name} manifest is required for Step 7.`);
    if (name !== "shot_manifest" && manifest.status !== "completed") throw new Error(`${name} manifest is not completed for Step 7.`);
  }
  if (!storyManifest || typeof storyManifest !== "object" || storyManifest.status !== "completed") throw new Error("story_manifest is not completed for Step 7.");
  const rankingPrompt = "Rank every Step 2 shot using only these completed manifests and the Step 6 story. Return a JSON object with a shots array containing exactly one object per Step 2 shot. Each shot object must contain exactly these fields: shot_id, source_id, story_relevance_score, visual_strength_score, ranking_score, ranking_status. Scores must be numbers from 0 to 100. Preserve identities exactly. A duplicate shot must not outrank its canonical equivalent unless story relevance or visual strength in the supplied metadata clearly justifies it.\n" + JSON.stringify(manifests);
  const result = await generateGeminiJson([{ text: rankingPrompt }], env, "Gemini returned invalid ranking JSON.");
  return normalizeRankingManifest(result, { ...shotManifest, _duplicate_manifest: duplicateManifest });
}

function normalizeSequenceManifest(result, rankingManifest) {
  if (!result || typeof result !== "object" || !Array.isArray(result.ordered_shots)) throw new Error("Gemini sequence result must contain an ordered_shots array.");
  if (result.sequence_status !== "completed") throw new Error("Gemini sequence result must be completed.");
  if (!result.ordered_shots.length) throw new Error("Completed sequences require at least one ordered shot.");
  const rankedById = new Map(rankingManifest.shots.map(shot => [shot.shot_id, shot]));
  const seen = new Set();
  const orderedShots = result.ordered_shots.map((shot, index) => {
    if (!shot || typeof shot !== "object" || Array.isArray(shot)) throw new Error(`Sequence shot at index ${index} is not an object.`);
    if (!Number.isInteger(shot.position) || shot.position !== index + 1) throw new Error(`Sequence shot at index ${index} must have contiguous position ${index + 1}.`);
    if (typeof shot.shot_id !== "string" || typeof shot.source_id !== "string") throw new Error(`Sequence shot at index ${index} is missing its identity.`);
    if (seen.has(shot.shot_id)) throw new Error(`Sequence shot at index ${index} duplicates its shot ID.`);
    const rankedShot = rankedById.get(shot.shot_id);
    if (!rankedShot) throw new Error(`Sequence shot at index ${index} is not present in the Step 7 ranking input.`);
    if (rankedShot.source_id !== shot.source_id) throw new Error(`Sequence shot at index ${index} does not match its ranked source.`);
    seen.add(shot.shot_id);
    return { position: shot.position, shot_id: shot.shot_id, source_id: shot.source_id };
  });
  return {
    sequence_id: `sequence_${orderedShots.map(shot => `${shot.source_id}_${shot.shot_id}`).join("__")}`,
    ordered_shots: orderedShots,
    sequence_status: "completed"
  };
}

async function analyzeSequence(manifests, env) {
  const { shot_manifest: shotManifest, story_manifest: storyManifest, ranking_manifest: rankingManifest } = manifests;
  for (const [name, manifest] of Object.entries({
    shot_manifest: shotManifest,
    quality_manifest: manifests.quality_manifest,
    visual_tag_manifest: manifests.visual_tag_manifest,
    duplicate_manifest: manifests.duplicate_manifest,
    ranking_manifest: rankingManifest
  })) {
    if (!manifest || typeof manifest !== "object" || !Array.isArray(manifest.shots)) throw new Error(`${name} manifest is required for Step 8.`);
    if (name !== "shot_manifest" && manifest.status !== "completed") throw new Error(`${name} manifest is not completed for Step 8.`);
  }
  if (!storyManifest || typeof storyManifest !== "object" || storyManifest.status !== "completed") throw new Error("story_manifest is not completed for Step 8.");
  const sequencePrompt = "Arrange a coherent sequence using the completed Step 6 story and Step 7 ranking. You may select a subset of ranked shots. Return a JSON object with sequence_status set to completed and ordered_shots containing only position, shot_id, and source_id. Positions must start at 1 and be contiguous. Preserve ranked shot identities and sources exactly. Use only the supplied manifests; do not invent shots.\n" + JSON.stringify(manifests);
  const result = await generateGeminiJson([{ text: sequencePrompt }], env, "Gemini returned invalid sequence JSON.");
  return normalizeSequenceManifest(result, rankingManifest);
}

function normalizeTimingManifest(result, sequenceManifest, shotManifest) {
  if (!result || typeof result !== "object" || !Array.isArray(result.shot_timings) || !Array.isArray(result.transitions)) throw new Error("Gemini timing result must contain shot_timings and transitions arrays.");
  if (result.timing_status !== "completed") throw new Error("Gemini timing result must be completed.");
  const sequenceShots = sequenceManifest.ordered_shots;
  if (result.shot_timings.length !== sequenceShots.length) throw new Error("Timing result must contain exactly the Step 8 ordered shots.");
  if (result.transitions.length !== Math.max(0, sequenceShots.length - 1)) throw new Error("Timing result must contain one transition per adjacent shot pair.");
  const sourceById = new Map(shotManifest.shots.map(shot => [shot.shot_id, shot]));
  const shotTimings = result.shot_timings.map((timing, index) => {
    const sequenceShot = sequenceShots[index];
    if (!timing || timing.position !== sequenceShot.position || timing.shot_id !== sequenceShot.shot_id || timing.source_id !== sequenceShot.source_id) throw new Error(`Timing shot at index ${index} does not exactly match the Step 8 sequence.`);
    const sourceShot = sourceById.get(timing.shot_id);
    if (!sourceShot || sourceShot.source_id !== timing.source_id) throw new Error(`Timing shot at index ${index} does not match its Step 2 source.`);
    if (!Number.isFinite(timing.source_in_sec) || !Number.isFinite(timing.use_duration_sec) || timing.use_duration_sec <= 0 || timing.source_in_sec < sourceShot.start_sec || timing.source_in_sec + timing.use_duration_sec > sourceShot.end_sec) throw new Error(`Timing shot at index ${index} exceeds its Step 2 source boundaries.`);
    return {
      position: timing.position,
      shot_id: timing.shot_id,
      source_id: timing.source_id,
      source_in_sec: timing.source_in_sec,
      use_duration_sec: timing.use_duration_sec
    };
  });
  const transitions = result.transitions.map((transition, index) => {
    const current = shotTimings[index];
    const next = shotTimings[index + 1];
    if (!transition || transition.from_shot_id !== current.shot_id || transition.to_shot_id !== next.shot_id) throw new Error(`Transition at index ${index} does not connect adjacent Step 8 shots.`);
    if (transition.transition_type !== "cut" && transition.transition_type !== "crossfade") throw new Error(`Transition at index ${index} has an unsupported type.`);
    const duration = transition.transition_type === "cut" ? 0 : transition.transition_duration_sec;
    if (!Number.isFinite(duration) || duration < 0 || (transition.transition_type === "crossfade" && duration <= 0) || duration > current.use_duration_sec || duration > next.use_duration_sec) throw new Error(`Transition at index ${index} has an invalid duration.`);
    return {
      transition_id: `transition_${String(index + 1).padStart(3, "0")}`,
      from_shot_id: current.shot_id,
      to_shot_id: next.shot_id,
      transition_type: transition.transition_type,
      transition_duration_sec: duration
    };
  });
  const timelineShots = [];
  shotTimings.forEach((timing, index) => {
    const previous = timelineShots[index - 1];
    timelineShots.push({
      ...timing,
      timeline_start_sec: index === 0 ? 0 : previous.timeline_start_sec + previous.use_duration_sec - transitions[index - 1].transition_duration_sec
    });
  });
  const finalShot = timelineShots[timelineShots.length - 1];
  const targetDuration = finalShot.timeline_start_sec + finalShot.use_duration_sec;
  if (!Number.isFinite(targetDuration) || targetDuration <= 0 || timelineShots.some(shot => shot.timeline_start_sec < 0)) throw new Error("Timing math produced an invalid target duration.");
  const usedDuration = timelineShots.reduce((total, shot) => total + shot.use_duration_sec, 0);
  const crossfadeDuration = transitions.reduce((total, transition) => total + (transition.transition_type === "crossfade" ? transition.transition_duration_sec : 0), 0);
  if (Math.abs(targetDuration - (usedDuration - crossfadeDuration)) > 0.000001) throw new Error("Timing math produced an inconsistent final duration.");
  return {
    timing_status: "completed",
    sequence_id: sequenceManifest.sequence_id,
    target_reel_duration_sec: targetDuration,
    shot_timings: timelineShots,
    transitions
  };
}

async function analyzeTiming(manifests, env) {
  const { shot_manifest: shotManifest, story_manifest: storyManifest, ranking_manifest: rankingManifest, sequence_manifest: sequenceManifest } = manifests;
  for (const [name, manifest] of Object.entries({
    shot_manifest: shotManifest,
    quality_manifest: manifests.quality_manifest,
    visual_tag_manifest: manifests.visual_tag_manifest,
    duplicate_manifest: manifests.duplicate_manifest,
    ranking_manifest: rankingManifest
  })) {
    if (!manifest || typeof manifest !== "object" || !Array.isArray(manifest.shots)) throw new Error(`${name} manifest is required for Step 9.`);
    if (name !== "shot_manifest" && manifest.status !== "completed") throw new Error(`${name} manifest is not completed for Step 9.`);
  }
  if (!storyManifest || typeof storyManifest !== "object" || storyManifest.status !== "completed") throw new Error("story_manifest is not completed for Step 9.");
  if (!sequenceManifest || typeof sequenceManifest !== "object" || sequenceManifest.sequence_status !== "completed" || typeof sequenceManifest.sequence_id !== "string" || !Array.isArray(sequenceManifest.ordered_shots)) throw new Error("sequence_manifest is not completed for Step 9.");
  const timingPrompt = "Choose timing decisions for this completed Step 8 sequence using the story, ranking, and shot boundaries. Return a JSON object with timing_status set to completed, shot_timings containing exactly one object per ordered shot with position, shot_id, source_id, source_in_sec, and use_duration_sec, and transitions containing one object per adjacent pair with from_shot_id, to_shot_id, transition_type (cut or crossfade), and transition_duration_sec. Keep source trims inside Step 2 boundaries. The code will calculate timeline starts, transition IDs, and final duration.\n" + JSON.stringify(manifests);
  const result = await generateGeminiJson([{ text: timingPrompt }], env, "Gemini returned invalid timing JSON.");
  return normalizeTimingManifest(result, sequenceManifest, shotManifest);
}

function normalizeTextAudioManifest(result, timingManifest) {
  if (!result || typeof result !== "object" || !Array.isArray(result.text_cues) || !Array.isArray(result.audio_cues)) throw new Error("Gemini text/audio result must contain text_cues and audio_cues arrays.");
  if (result.text_audio_status !== "completed") throw new Error("Gemini text/audio result must be completed.");
  if (result.sequence_id !== timingManifest.sequence_id) throw new Error("Text/audio output must preserve the Step 9 sequence ID.");
  const targetDuration = timingManifest.target_reel_duration_sec;
  const shotIds = new Set((timingManifest.shot_timings || []).map(timing => timing.shot_id));
  if (!Number.isFinite(targetDuration) || targetDuration < 0) throw new Error("Timing manifest has an invalid target duration.");
  const cueIds = new Set();
  function normalizeCue(cue, index, type) {
    if (!cue || typeof cue !== "object" || Array.isArray(cue)) throw new Error(`${type} cue at index ${index} is not an object.`);
    if (cue.shot_id !== null && cue.shot_id !== undefined && !shotIds.has(cue.shot_id)) throw new Error(`${type} cue at index ${index} references an unknown shot ID.`);
    if (!Number.isFinite(cue.timeline_start_sec) || !Number.isFinite(cue.timeline_end_sec) || cue.timeline_start_sec < 0 || cue.timeline_end_sec < cue.timeline_start_sec || cue.timeline_end_sec > targetDuration) throw new Error(`${type} cue at index ${index} has an invalid timeline range.`);
    const cueId = `${type.toLowerCase()}_cue_${String(index + 1).padStart(3, "0")}`;
    if (cueIds.has(cueId)) throw new Error(`Cue IDs must be unique: ${cueId}`);
    cueIds.add(cueId);
    return type === "text" ? {
      cue_id: cueId,
      shot_id: cue.shot_id ?? null,
      text: cue.text ?? null,
      language: cue.language ?? null,
      timeline_start_sec: cue.timeline_start_sec,
      timeline_end_sec: cue.timeline_end_sec,
      placement_hint: cue.placement_hint ?? null
    } : {
      cue_id: cueId,
      audio_type: cue.audio_type ?? null,
      shot_id: cue.shot_id ?? null,
      asset_ref: cue.asset_ref ?? null,
      script: cue.script ?? null,
      timeline_start_sec: cue.timeline_start_sec,
      timeline_end_sec: cue.timeline_end_sec,
      gain_db: cue.gain_db ?? null
    };
  }
  return {
    text_audio_status: "completed",
    sequence_id: timingManifest.sequence_id,
    text_cues: result.text_cues.map((cue, index) => normalizeCue(cue, index, "text")),
    audio_cues: result.audio_cues.map((cue, index) => normalizeCue(cue, index, "audio"))
  };
}

async function analyzeTextAudio(manifests, env) {
  const { timing_manifest: timingManifest, story_manifest: storyManifest, ranking_manifest: rankingManifest, visual_tag_manifest: visualTagManifest } = manifests;
  if (!timingManifest || typeof timingManifest !== "object" || timingManifest.timing_status !== "completed" || !Array.isArray(timingManifest.shot_timings)) throw new Error("timing_manifest is not completed for Step 10.");
  if (!storyManifest || storyManifest.status !== "completed") throw new Error("story_manifest is not completed for Step 10.");
  if (!rankingManifest || rankingManifest.status !== "completed" || !Array.isArray(rankingManifest.shots)) throw new Error("ranking_manifest is not completed for Step 10.");
  if (!visualTagManifest || visualTagManifest.status !== "completed" || !Array.isArray(visualTagManifest.shots)) throw new Error("visual_tag_manifest is not completed for Step 10.");
  const textAudioPrompt = "Create sparse text and audio cues for this completed Step 9 timing. Support the footage; do not add text to every shot. Return a JSON object with text_audio_status set to completed, the exact sequence_id, text_cues, and audio_cues. Cue ranges must stay within the target duration and cue shot_id values must reference the timed shots; empty arrays are valid. Text cue fields: shot_id, text, language, timeline_start_sec, timeline_end_sec, placement_hint. Audio cue fields: audio_type, shot_id, asset_ref, script, timeline_start_sec, timeline_end_sec, gain_db.\n" + JSON.stringify(manifests);
  const result = await generateGeminiJson([{ text: textAudioPrompt }], env, "Gemini returned invalid text/audio JSON.");
  return normalizeTextAudioManifest(result, timingManifest);
}

function normalizeStyleJudgeManifest(result, manifests) {
  if (!result || typeof result !== "object" || !Array.isArray(result.criteria_results) || !Array.isArray(result.issues)) throw new Error("Gemini style judge result must contain criteria_results and issues arrays.");
  if (result.style_judge_status !== "completed") throw new Error("Gemini style judge result must be completed.");
  const sequenceId = manifests.sequence_manifest.sequence_id;
  if (result.sequence_id !== sequenceId) throw new Error("Style judge output must preserve the sequence ID.");
  if (!Number.isFinite(result.overall_score) || result.overall_score < 0 || result.overall_score > 100) throw new Error("Style judge overall score must be from 0 to 100.");
  if (result.decision !== "pass" && result.decision !== "revise") throw new Error("Style judge decision must be pass or revise.");
  const shotIds = new Set(manifests.sequence_manifest.ordered_shots.map(shot => shot.shot_id));
  const cueIds = new Set([
    ...manifests.text_audio_manifest.text_cues.map(cue => cue.cue_id),
    ...manifests.text_audio_manifest.audio_cues.map(cue => cue.cue_id)
  ]);
  const criterionIds = new Set();
  const criteriaResults = result.criteria_results.map((criterion, index) => {
    if (!criterion || typeof criterion !== "object" || typeof criterion.score !== "number" || !Number.isFinite(criterion.score) || criterion.score < 0 || criterion.score > 100 || criterionIds.has(criterion.criterion_id)) throw new Error(`Criterion at index ${index} is invalid.`);
    criterionIds.add(criterion.criterion_id);
    return { criterion_id: `criterion_${String(index + 1).padStart(3, "0")}`, score: criterion.score, notes: criterion.notes ?? null };
  });
  const issueIds = new Set();
  const issues = result.issues.map((issue, index) => {
    if (!issue || typeof issue !== "object" || issueIds.has(issue.issue_id)) throw new Error(`Issue at index ${index} is invalid.`);
    if (issue.shot_id !== null && issue.shot_id !== undefined && !shotIds.has(issue.shot_id)) throw new Error(`Issue at index ${index} references an unknown shot ID.`);
    if (issue.cue_id !== null && issue.cue_id !== undefined && !cueIds.has(issue.cue_id)) throw new Error(`Issue at index ${index} references an unknown cue ID.`);
    issueIds.add(issue.issue_id);
    return { issue_id: `issue_${String(index + 1).padStart(3, "0")}`, severity: issue.severity ?? null, category: issue.category ?? null, message: issue.message ?? null, shot_id: issue.shot_id ?? null, cue_id: issue.cue_id ?? null };
  });
  return { style_judge_status: "completed", sequence_id: sequenceId, style_profile_id: "qn_video_v1", overall_score: result.overall_score, decision: result.decision, criteria_results: criteriaResults, issues };
}

async function analyzeStyleJudge(manifests, env) {
  const { sequence_manifest: sequenceManifest, timing_manifest: timingManifest, text_audio_manifest: textAudioManifest } = manifests;
  if (!manifests.story_manifest || manifests.story_manifest.status !== "completed") throw new Error("story_manifest is not completed for Step 11.");
  if (!manifests.ranking_manifest || manifests.ranking_manifest.status !== "completed") throw new Error("ranking_manifest is not completed for Step 11.");
  if (!manifests.quality_manifest || manifests.quality_manifest.status !== "completed" || !Array.isArray(manifests.quality_manifest.shots)) throw new Error("quality_manifest is not completed for Step 11.");
  if (!manifests.visual_tag_manifest || manifests.visual_tag_manifest.status !== "completed" || !Array.isArray(manifests.visual_tag_manifest.shots)) throw new Error("visual_tag_manifest is not completed for Step 11.");
  if (!sequenceManifest || sequenceManifest.sequence_status !== "completed" || typeof sequenceManifest.sequence_id !== "string") throw new Error("sequence_manifest is not completed for Step 11.");
  if (!timingManifest || timingManifest.timing_status !== "completed") throw new Error("timing_manifest is not completed for Step 11.");
  if (!textAudioManifest || textAudioManifest.text_audio_status !== "completed" || !Array.isArray(textAudioManifest.text_cues) || !Array.isArray(textAudioManifest.audio_cues)) throw new Error("text_audio_manifest is not completed for Step 11.");
  const selectedIds = new Set(sequenceManifest.ordered_shots.map(shot => shot.shot_id));
  const selectedVisual = manifests.visual_tag_manifest.shots.filter(shot => selectedIds.has(shot.shot_id));
  const selectedQuality = manifests.quality_manifest.shots.filter(shot => selectedIds.has(shot.shot_id));
  const judgeInput = { ...manifests, visual_tag_manifest: { ...manifests.visual_tag_manifest, shots: selectedVisual }, quality_manifest: { ...manifests.quality_manifest, shots: selectedQuality } };
  const stylePrompt = "Judge this completed reel plan against the QN VIDEO v1 style profile below. Return a JSON object with style_judge_status set to completed, the exact sequence_id, overall_score from 0 to 100, decision pass or revise, criteria_results, and issues. Use sparse, actionable issues only. Issue shot_id values must be selected shots and issue cue_id values must be existing cues. The code will assign stable criterion and issue IDs.\n\nQN VIDEO v1 STYLE PROFILE:\n" + QN_VIDEO_INSTRUCTIONS + "\n\nCOMPLETED REEL MANIFESTS:\n" + JSON.stringify(judgeInput);
  const result = await generateGeminiJson([{ text: stylePrompt }], env, "Gemini returned invalid style judge JSON.");
  return normalizeStyleJudgeManifest(result, judgeInput);
}

const JOB_KEY_PREFIX = "qn:job:";
const memoryJobs = new Map();

function normalizeJobSources(sourceManifest) {
  const sources = Array.isArray(sourceManifest?.sources) ? sourceManifest.sources : sourceManifest?.clips;
  if (!Array.isArray(sources) || sources.length < 2) throw new Error("At least two sources are required.");
  return sources.map((source, index) => {
    const sourceId = typeof source?.source_id === "string" && source.source_id.trim() ? source.source_id.trim() : `src_${String(index + 1).padStart(3, "0")}`;
    const driveFileId = typeof source?.drive_file_id === "string" ? source.drive_file_id.trim() : "";
    const filename = typeof source?.filename === "string" ? source.filename.trim() : "";
    if (!driveFileId || !filename) throw new Error(`Source ${sourceId} is missing drive_file_id or filename.`);
    return {
      source_id: sourceId,
      drive_file_id: driveFileId,
      filename,
      local_path: `/QN_RENDER_SOURCE/${filename}`,
      local_ready: false
    };
  });
}

async function putJob(env, job) {
  const key = JOB_KEY_PREFIX + job.job_id;
  if (env.JOBS?.put) await env.JOBS.put(key, JSON.stringify(job));
  else memoryJobs.set(key, job);
}

async function listJobs(env) {
  if (!env.JOBS?.list) return [...memoryJobs.values()];
  const listed = await env.JOBS.list({ prefix: JOB_KEY_PREFIX });
  const jobs = await Promise.all(listed.keys.map(async key => {
    const value = await env.JOBS.get(key.name, "json");
    return value || null;
  }));
  return jobs.filter(Boolean);
}

async function createJob(request, env) {
  let body;
  try { body = await request.json(); } catch { throw new Error("Invalid JSON body."); }
  const sources = normalizeJobSources(body.source_manifest || body);
  const jobId = crypto.randomUUID();
  const sourceManifest = { job_id: jobId, step: "01_source_intake", sources };
  const job = { job_id: jobId, status: "queued", step: "01_source_intake", source_manifest: sourceManifest, sources, created_at: new Date().toISOString() };
  await putJob(env, job);
  return job;
}

async function claimNextJob(env) {
  const jobs = (await listJobs(env)).filter(job => job.status === "queued").sort((left, right) => String(left.created_at).localeCompare(String(right.created_at)));
  const job = jobs[0];
  if (!job) return null;
  job.status = "claimed";
  job.claimed_at = new Date().toISOString();
  await putJob(env, job);
  return job;
}

export default { async fetch(request, env) {
  const url = new URL(request.url);
  if (request.method === "GET" && url.pathname === "/") return new Response(renderHtml(env), { headers: { "content-type": "text/html; charset=utf-8" } });
  if (request.method === "GET" && url.pathname === "/api/health") return json({ ok: true, service: "qn-video-planner" });
  if (request.method === "POST" && url.pathname === "/api/auth/check") return json({ valid: !!env.CONTROL_KEY && request.headers.get("x-control-key") === env.CONTROL_KEY });
  if (request.method === "POST" && url.pathname === "/api/jobs") {
    if (!authorized(request, env)) return json({ error: "Unauthorized" }, 401);
    try { return json({ success: true, job: await createJob(request, env) }, 201); } catch (error) { return json({ error: error instanceof Error ? error.message : "Could not create job." }, 400); }
  }
  const statusMatch = request.method === "POST" ? url.pathname.match(/^\/api\/jobs\/([^/]+)\/status$/) : null;
  if (statusMatch) {
    if (!authorized(request, env)) return json({ error: "Unauthorized" }, 401);
    const jobId = decodeURIComponent(statusMatch[1]);
    const key = JOB_KEY_PREFIX + jobId;
    let body;
    try { body = await request.json(); } catch { return json({ error: "Invalid JSON body" }, 400); }
    const job = env.JOBS?.get ? await env.JOBS.get(key, "json") : memoryJobs.get(key);
    if (!job) return json({ error: "Job not found" }, 404);
    for (const field of ["status", "progress", "error", "outputDriveUrl", "shot_manifest", "quality_manifest", "visual_tag_manifest", "duplicate_manifest", "story_manifest", "ranking_manifest"]) {
      if (Object.prototype.hasOwnProperty.call(body, field)) job[field] = body[field];
    }
    await putJob(env, job);
    return json({ success: true, job });
  }
  const storyMatch = request.method === "POST" ? url.pathname.match(/^\/api\/jobs\/([^/]+)\/story$/) : null;
  if (storyMatch) {
    if (!authorized(request, env)) return json({ error: "Unauthorized" }, 401);
    let body; try { body = await request.json(); } catch { return json({ error: "Invalid JSON body" }, 400); }
    try {
      const storyManifest = await analyzeStory({
        shot_manifest: body.shot_manifest,
        quality_manifest: body.quality_manifest,
        visual_tag_manifest: body.visual_tag_manifest,
        duplicate_manifest: body.duplicate_manifest
      }, env);
      return json({ success: true, story_manifest: storyManifest });
    } catch (error) {
      console.error("Gemini story analysis failed", error);
      return json({ error: error instanceof Error ? error.message : "Gemini story analysis failed." }, 502);
    }
  }
  const rankingMatch = request.method === "POST" ? url.pathname.match(/^\/api\/jobs\/([^/]+)\/ranking$/) : null;
  if (rankingMatch) {
    if (!authorized(request, env)) return json({ error: "Unauthorized" }, 401);
    let body; try { body = await request.json(); } catch { return json({ error: "Invalid JSON body" }, 400); }
    try {
      const rankingManifest = await analyzeRanking({
        shot_manifest: body.shot_manifest,
        quality_manifest: body.quality_manifest,
        visual_tag_manifest: body.visual_tag_manifest,
        duplicate_manifest: body.duplicate_manifest,
        story_manifest: body.story_manifest
      }, env);
      return json({ success: true, ranking_manifest: rankingManifest });
    } catch (error) {
      console.error("Gemini ranking analysis failed", error);
      return json({ error: error instanceof Error ? error.message : "Gemini ranking analysis failed." }, 502);
    }
  }
  if (request.method === "GET" && url.pathname === "/api/jobs/next") {
    if (!authorized(request, env)) return json({ error: "Unauthorized" }, 401);
    try { return json({ job: await claimNextJob(env) }); } catch (error) { console.error("Job polling failed", error); return json({ error: "Could not poll jobs." }, 500); }
  }
  const jobMatch = request.method === "GET" ? url.pathname.match(/^\/api\/jobs\/([^/]+)$/) : null;
  if (jobMatch) {
    if (!authorized(request, env)) return json({ error: "Unauthorized" }, 401);
    const key = JOB_KEY_PREFIX + decodeURIComponent(jobMatch[1]);
    const job = env.JOBS?.get ? await env.JOBS.get(key, "json") : memoryJobs.get(key);
    return job ? json({ job }) : json({ error: "Job not found" }, 404);
  }
  if (request.method === "POST" && url.pathname === "/api/analyze") {
    if (!authorized(request, env)) return json({ error: "Unauthorized" }, 401);
    let body; try { body = await request.json(); } catch { return json({ error: "Invalid JSON body" }, 400); }
    if (!Array.isArray(body.fileIds) || !body.fileIds.length || body.fileIds.some(id => typeof id !== "string" || !id.trim())) return json({ error: "Select at least one Drive video file." }, 400);
    if (typeof body.driveAccessToken !== "string" || !body.driveAccessToken.trim()) return json({ error: "Google Drive authorization is required." }, 400);
    try { return json({ success: true, editPlan: await analyze(body.fileIds.map(id => id.trim()), body.driveAccessToken.trim(), env) }); } catch (error) { console.error("Gemini analysis failed", error); return json({ error: error instanceof Error ? error.message : "Gemini analysis failed." }, 502); }
  }
  return json({ error: "Not found" }, 404);
} };
