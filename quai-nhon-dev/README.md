# Quai Nhon DEV - Video Planner

Purpose:
- Connect Google Drive and select source video files with Google Picker.
- Analyze the selected footage with Gemini using `QN_VIDEO_v1.md`.
- Display and download the generated `edit.json` plan.
- The Worker does not queue, render, archive, or persist plans.

## Google Drive setup

In Google Cloud Console, create or select the project used by this Worker:

1. Enable **Google Drive API**, **Google Picker API**, and **Google Identity Services**.
2. Configure the OAuth consent screen and add the intended account as a test user while the app is in testing.
3. Create an OAuth client of type **Web application**. Add the deployed Worker origin and the Codespaces origin as authorized JavaScript origins.
4. Create a browser API key, restrict it to **Google Picker API** and **Google Drive API**, and restrict HTTP referrers to the same origins.
5. Use the Google Cloud project number as the Picker app ID.

Put the browser configuration values in the `[vars]` section of `wrangler.dev.toml` and `wrangler.toml`:

```toml
GOOGLE_CLIENT_ID = "...apps.googleusercontent.com"
GOOGLE_API_KEY = "..."
GOOGLE_APP_ID = "your-project-number"
GOOGLE_SOURCE_FOLDER_ID = "your-source-folder-id"
```

These are browser configuration values, not access tokens. The app requests only `https://www.googleapis.com/auth/drive.file`; access tokens remain in browser memory and are sent only to the Worker for the current analysis.

Add the Gemini API key as a Worker secret. It is used only by the backend and is never sent to the browser:

```bash
npx wrangler secret put GEMINI_API_KEY
```

The analysis route defaults to `gemini-3.7-flash`. Set `GEMINI_MODEL` as a Worker variable if a different configured Gemini Flash model is required.

## Install

```bash
npm install
```

## Add control-key secret

```bash
npx wrangler secret put CONTROL_KEY
```

`CONTROL_KEY` protects the analysis endpoint and is entered in the web UI.

## Run locally

```bash
npm run dev
```

The local dev script uses `wrangler.dev.toml` and supplies `CONTROL_KEY=local-dev-key` to Wrangler. Enter `local-dev-key` in the panel. Open the forwarded port shown by Codespaces, normally port `8787`.

## Deploy

```bash
npm run deploy
```

## Analysis API

The web UI sends selected Drive file metadata and its temporary Drive access token to `POST /api/analyze`. The Worker downloads the media, calls Gemini, validates the response as JSON, and returns `{ "success": true, "editPlan": { ... } }`. The Drive token is not persisted.
