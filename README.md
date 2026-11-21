# FERHAN — Quran Learning Academy

A mobile-friendly, installable Quran and Arabic learning academy with English and Amharic support.

FERHAN is a static Arabic and Amharic Quran-learning website. It is hosted on GitHub Pages. Quran Foundation chapter audio and word-level timing data are retrieved by GitHub Actions and published as static JSON files.

## Included learning features

- Arabic + Amharic academy, lessons, repeat practice, Tajweed and quizzes.
- TikTok-style vertical snap-scroll micro-lessons: swipe through letters, letter forms, harakāt, tanwīn, sukūn, shaddah, blending, vocabulary, basic naḥw, ṣarf, and unvowelled reading inference.
- Each micro-lesson includes Arabic text, Amharic and English explanations, listen/repeat speech, reveal/check answers, and a with/without-tashkīl comparison.
- Full Qur’an reader for all 114 surahs with word-by-word Arabic, transliteration and English glosses, plus Amharic verse translations; toggle tashkīl on/off.
- Browser speech synthesis for Arabic words and phrases where an Arabic voice is available.
- Al-Fatihah word-by-word study and short-surah lessons.
- Synchronized chapter playback and word highlighting for chapters 1, 112, 113 and 114.
- Local bookmarks, lesson completion, memorisation checklists and JSON backup/restore.
- No learner account is required. Progress remains in the learner's browser.

## Architecture

- **GitHub Pages:** serves `index.html` and static assets, including `data/quran-word-by-word.json` (the supplied full Qur’an word-level dataset).
- **GitHub Actions:** securely authenticates with Quran Foundation, downloads chapter audio URLs and word timing segments, then commits the resulting JSON files.
- **Browser:** reads `./data/recitation/{chapter}.json`. No Client ID, Client Secret, access token, Worker URL or backend credentials are placed in the website.

This uses GitHub as the only hosting and automation platform. GitHub Actions is a scheduled build/data-refresh job, not a continuously running API server.

## 1. Confirm Quran Foundation permissions

The Ferhan app must have production access to `content.audio.read`. The screenshots supplied for this project show the following scopes as **GRANTED**: audio, Quran, translations, tafsir and Q&A. The audio permission is the one required by this workflow for recitation audio and word timing segments.

## 2. Add GitHub repository secrets and variable

Open your repository on GitHub:

**Settings → Secrets and variables → Actions**

Under **Secrets**, add:

| Name | Value |
|---|---|
| `QF_CLIENT_ID` | Client ID from Quran Foundation → Ferhan → Credentials |
| `QF_CLIENT_SECRET` | Client Secret from Quran Foundation → Ferhan → Credentials |

Under **Variables**, add:

| Name | Value |
|---|---|
| `QF_CHAPTER_RECITER_ID` | The chapter-reciter ID for the reciter you want |

The chapter-reciter ID is not necessarily the same as an ayah-by-ayah recitation ID. Verify it from Quran Foundation's chapter-reciter resources. Do not guess this ID. The workflow fails safely if it is missing or if the API response does not include word timestamps.

Optional: set `QF_RECITER_NAME` as a repository variable if you want a specific display label. Otherwise the app displays “Configured Quran Foundation reciter”.

Never commit credentials to files, paste them into `index.html`, or put them in repository variables. The Client Secret must be a GitHub Actions **Secret**.

## 3. Upload these files to GitHub

Upload the contents of this ZIP to the root of your GitHub repository. Keep the `.github/workflows/update-quran-data.yml` path intact. If GitHub's web uploader hides dot-folders, create the workflow file using **Add file → Create new file** and enter the full path:
`.github/workflows/update-quran-data.yml`

The repository root should contain:
- `index.html`
- `data/quran-word-by-word.json`
- `README.md`
- `.github/workflows/update-quran-data.yml`
- `scripts/update-recitation.mjs`

## 4. Enable GitHub Pages

In **Settings → Pages**:
1. Under **Build and deployment**, choose **Deploy from a branch**.
2. Select branch `main` (or your default branch).
3. Select folder `/ (root)`.
4. Save.

If your default branch is not `main`, select the actual branch.

## 5. Run the Quran data workflow

1. Open the repository's **Actions** tab.
2. Select **Update Quran recitation data**.
3. Press **Run workflow**.
4. Wait for the run to complete successfully.
5. Confirm that the workflow creates:
   - `data/recitation/1.json`
   - `data/recitation/112.json`
   - `data/recitation/113.json`
   - `data/recitation/114.json`

The workflow also runs automatically every Monday at 02:17 UTC. You can run it manually whenever you want to refresh the data.

If the workflow cannot access a chapter, check the run log. Common causes are an incorrect chapter-reciter ID, missing production audio permission, or a reciter/chapter that does not provide word-level segments. FERHAN does not invent or estimate missing timestamps.

## 6. Test the website

Open the GitHub Pages URL. Go to Qur’an recitation and press **Check GitHub data**. Then press **Play Al-Fātiḥah with word sync** or select one of the supported short surahs and use **Play with word sync**.

Audio playback requires an internet connection. The first workflow run must finish before synchronized playback can work.

## Troubleshooting

- **No data / 404:** run the Actions workflow and check that the JSON files were committed to the repository.
- **OAuth 401/403:** check the Client ID/Secret and that the production app is active and has `content.audio.read` granted.
- **Chapter request fails:** confirm `QF_CHAPTER_RECITER_ID` is a chapter-reciter ID and that the app has permission.
- **No segments:** the chosen reciter/chapter did not return word-level timestamps. FERHAN will not fabricate timing.
- **Pages not updating:** check Settings → Pages and wait for the latest deployment.

## Local progress and privacy

Bookmarks, lesson completion and memorisation checklists remain in browser local storage. They are not synced between devices. Export a JSON backup before clearing browser data or changing devices.

## Quran Foundation documentation

- OAuth quickstart: https://api-docs.quran.foundation/docs/quickstart/
- Audio API: https://api-docs.quran.com/docs/sdk/javascript/audio/
- Chapter recitation endpoint: https://api-docs.quran.foundation/docs/content_apis_versioned/4.0.0/chapter-reciter-audio-file/


## Integrated source data and attribution

The full Qur’an word-by-word Arabic text, transliteration and English glosses were carried over from the supplied “Ferhan Quran Learning for Adults” HTML file. That source credits Quranwbw.com (with credits there to quran.com, tanzil.net and seventysixnine.com). The Amharic ayah translations are included unmodified and attributed in the source file to Muhammed Sadiq & Muhammed Sani Habib (am.sadiq, Tanzil.net, 2012). Word-level Amharic glosses remain available for Al-Fātiḥah in the academy's existing word study. Please retain these attributions and have translations reviewed by a qualified teacher.

The scroll lessons are introductory learning material, not a substitute for a qualified Arabic or Qur’an teacher. Unvowelled Arabic can be ambiguous; use vocabulary, morphology, syntax and context, and verify recitation against a trusted mushaf and teacher. Browser voice output depends on installed device voices and may not model tajweed accurately.


## Integrated additions in this build

- The supplied QuranWBW Uthmani font is bundled locally and applied to Arabic learning and Qur’an text.
- QuranWBW application icons are included for the installable PWA.
- A web app manifest and service worker provide installability and offline caching of the app shell and previously opened same-origin data.
- The supplied full Qur’an word-by-word dataset and the Amharic translation data remain in `data/quran-word-by-word.json`.

## Important deployment notes

- Serve this project over HTTPS (GitHub Pages does this automatically). Service workers and install prompts do not work from a local `file://` URL.
- The initial app shell is cached on first successful visit. Qur’an data and other same-origin resources are cached after they are fetched; open the surahs you want available offline while connected.
- Audio and browser speech availability depend on the device, network and installed Arabic voices. Speech synthesis is a pronunciation aid, not a tajweed-certified reciter.
- The GitHub Actions workflow is the only place Quran Foundation credentials are used. Keep `QF_CLIENT_SECRET` in GitHub Actions Secrets, never in the browser app.
