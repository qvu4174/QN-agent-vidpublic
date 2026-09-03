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

function json(data, status = 200) { return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8" } }); }
function authorized(request, env) { const expected = env.CONTROL_KEY || ""; return !expected || request.headers.get("x-control-key") === expected; }
function renderHtml(env) { const config = JSON.stringify({ clientId: env.GOOGLE_CLIENT_ID || "", apiKey: env.GOOGLE_API_KEY || "", appId: env.GOOGLE_APP_ID || "", sourceFolderId: env.GOOGLE_SOURCE_FOLDER_ID || "" }).replace(/</g, "\\u003c"); return HTML.replace("__QN_GOOGLE_CONFIG__", config); }
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

async function analyze(fileIds, driveAccessToken, env) {
  if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured on the Worker.");
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
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(env.GEMINI_MODEL || "gemini-3.7-flash") + ":generateContent?key=" + encodeURIComponent(env.GEMINI_API_KEY), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ contents: [{ role: "user", parts }], generationConfig: { responseMimeType: "application/json" } }) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "Gemini analysis failed.");
  const text = (data.candidates?.[0]?.content?.parts || []).map(part => part.text || "").join("");
  try { return parseGeminiJson(text); } catch (error) { console.error("Gemini returned invalid JSON", { responseText: text.slice(0, 20000), error: String(error) }); throw new Error("Gemini returned invalid edit-plan JSON."); }
}

export default { async fetch(request, env) {
  const url = new URL(request.url);
  if (request.method === "GET" && url.pathname === "/") return new Response(renderHtml(env), { headers: { "content-type": "text/html; charset=utf-8" } });
  if (request.method === "GET" && url.pathname === "/api/health") return json({ ok: true, service: "qn-video-planner" });
  if (request.method === "POST" && url.pathname === "/api/auth/check") return json({ valid: !!env.CONTROL_KEY && request.headers.get("x-control-key") === env.CONTROL_KEY });
  if (request.method === "POST" && url.pathname === "/api/analyze") {
    if (!authorized(request, env)) return json({ error: "Unauthorized" }, 401);
    let body; try { body = await request.json(); } catch { return json({ error: "Invalid JSON body" }, 400); }
    if (!Array.isArray(body.fileIds) || !body.fileIds.length || body.fileIds.some(id => typeof id !== "string" || !id.trim())) return json({ error: "Select at least one Drive video file." }, 400);
    if (typeof body.driveAccessToken !== "string" || !body.driveAccessToken.trim()) return json({ error: "Google Drive authorization is required." }, 400);
    try { return json({ success: true, editPlan: await analyze(body.fileIds.map(id => id.trim()), body.driveAccessToken.trim(), env) }); } catch (error) { console.error("Gemini analysis failed", error); return json({ error: error instanceof Error ? error.message : "Gemini analysis failed." }, 502); }
  }
  return json({ error: "Not found" }, 404);
} };
