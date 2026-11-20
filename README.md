# FERHAN — Quran Arabic Learning (V6.1)

FERHAN (فَرْحَان) is the rebranded V6 learning website with synchronized recitation word highlighting.

## What changed
- Rebranded visible UI, page title, backup filenames and documentation to **FERHAN**.
- Migrates saved progress from Noor V5 and the previous previous V6 local-storage keys where possible.
- Adds synchronized chapter playback for Al-Fatihah (1), Al-Ikhlas (112), Al-Falaq (113) and An-Nas (114).
- Highlights the current word automatically using Quran Foundation word timing segments, in milliseconds.
- Uses the exact chapter audio returned alongside its timing data; it does not estimate timing or align timings to a different audio recording.
- Manual tap-to-focus word study remains available.
- Keeps progress/bookmarks local and account-free.

## Important: one-time secure backend setup is required

The static website cannot safely call the Quran Foundation Content API directly because it requires a confidential `client_secret`. The included `worker/` folder is a Cloudflare Worker proxy. Keep credentials in Worker secrets only.

### 1. Obtain Quran Foundation backend credentials
Create a **Backend/server** app in the Quran Foundation Developer Console and request the Content Audio read permission/scope needed for chapter recitations with segments. New backend apps may use granular scopes such as `content.audio.read`; existing credentials that hold the legacy `content` scope should set `QF_SCOPE=content`.

Use the production environment only after access has been approved. For initial testing, the Worker defaults to prelive.

Official documentation:
- Audio API and word-level segments: https://api-docs.quran.com/docs/sdk/javascript/audio/
- Chapter recitation endpoint: https://api-docs.quran.foundation/docs/content_apis_versioned/4.0.0/chapter-reciter-audio-file/
- Content API OAuth2 quickstart: https://api-docs.quran.foundation/docs/quickstart/

### 2. Find the chapter-reciter ID
Set `QF_CHAPTER_RECITER_ID` to the **chapter-reciter ID** for the reciter you intend to hear. It is not the ayah-by-ayah recitation ID. Confirm that the returned audio is the reciter you want before using it for study. Set QF_RECITER_NAME to the exact name for the chosen chapter-reciter ID. Do not assume a numeric ID; verify it in Quran Foundation's chapter-reciter resources.

### 3. Deploy the Worker on Cloudflare
From the `worker/` directory:
1. Create a Worker named `ferhan-quran-timing`.
2. Upload `index.js` and apply `wrangler.toml` settings, or deploy with Wrangler.
3. Add these Worker secrets:
   - `QF_CLIENT_ID`
   - `QF_CLIENT_SECRET`
   - `QF_CHAPTER_RECITER_ID`
   - `ALLOWED_ORIGIN` — the exact website origin, e.g. `https://YOUR-USERNAME.github.io`. For local testing, use your local HTTPS origin. Do not use `*` on a public production deployment.
4. Keep `QF_ENV=prelive` while testing. Set `QF_ENV=production` only when production credentials and permissions are ready.
5. Set `QF_SCOPE=content.audio.read` for granular-scope credentials, or `content` for credentials that hold the legacy scope.
6. Test `https://YOUR-WORKER.workers.dev/health`. It should return `{"ok":true,...}`.

The Worker caches the OAuth access token in memory, retries once after a 401, validates allowed browser origins, and returns only audio URLs and timing data. It never sends the client secret or access token to the website.

### 4. Connect the website
Open `index.html`, go to Qur’an practice, choose **Connect timing service**, and paste your Worker URL, for example `https://ferhan-quran-timing.YOUR-SUBDOMAIN.workers.dev`.

Then press:
- **Play Al-Fātiḥah with word sync**, or
- **Play with word sync** after selecting surah 112, 113 or 114.

The browser stores only the Worker URL locally. No Quran Foundation credentials are stored in the website.

## Timing and recitation integrity
- Word highlighting is driven by the exact timing segments returned for the chapter audio currently playing.
- The API segment triplets are `[word_index, start_ms, end_ms]`, with word indices starting at 1 and time values in milliseconds.
- If the API does not return word-level segments for a surah/reciter, FERHAN reports that and does not create approximate timings.
- Word segmentation can differ from how a study gloss splits Arabic tokens. Review highlighted text with a trusted Mushaf and qualified Qur'an teacher.
- A chapter-reciter ID must correspond to the intended reciter. If a different reciter ID is configured, the audio label must be updated accordingly.

## Preserved from V5/V6
- Arabic + Amharic learning interface, six-stage academy, lessons, repeat practice, Tajweed, quizzes and embedded YouTube courses.
- Al-Fatihah word-by-word study and short surah lessons.
- Local bookmarks, lesson completion, memorisation checklists, revision and JSON backup/restore.
- No learner account or cloud progress storage is introduced.

## Local progress and migration
- Progress stays in browser local storage.
- The app migrates older Noor V5 keys and previous V6 browser-storage keys to FERHAN V6 keys on the same browser where possible.
- Export a JSON backup before clearing browser data or changing devices.
- Audio and YouTube playback require internet access. The timing Worker requires a configured Quran Foundation backend.

## Run a quick syntax check
Use a modern browser and test the browser console. For local JavaScript syntax validation, extract the inline script from `index.html` and run `node --check` on it.
