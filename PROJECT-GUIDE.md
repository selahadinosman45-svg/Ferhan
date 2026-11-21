# FERHAN integrated learning academy

This folder is the deployable static website.

## Main learning areas
- Home dashboard and learner progress
- Academy roadmap and staged Arabic foundations
- 57+ foundation lessons and a progressive vertical reading feed with 6,236 Qur’anic ayah cards plus facts, jokes, proverbs and sourced hadith excerpts
- Repeat-and-practise reading exercises
- Complete Qur’an reader: all 114 surahs and 6,236 ayahs, with Arabic word-by-word text, transliteration, English glosses and Amharic verse translations
- Practical Tajweed drills with Arabic examples, Amharic guidance, listening actions, revealable practice prompts and quizzes
- Video-course/resource area
- Quran Foundation synchronized recitation player for all 114 surahs, subject to each chapter-reciter response providing word-level timing segments

## Language support
- Arabic source text
- English transliteration, glosses and explanations
- Amharic explanations and verse translations

## Files
- `index.html` — application interface and learning content
- `data/quran-word-by-word.json` — 114-surah Qur’an word-level data and Amharic translations
- `assets/fonts/` — locally bundled Uthmani Arabic font
- `assets/icons/` — app icons
- `manifest.webmanifest` and `service-worker.js` — installability and offline cache
- `.github/workflows/update-quran-data.yml` — secure recitation-data refresh workflow
- `scripts/update-recitation.mjs` — server-side workflow script; never runs in the browser

## Quick start
Deploy the folder contents to the root of a GitHub repository, enable GitHub Pages, then visit the HTTPS Pages URL. Follow `README.md` to configure Quran Foundation Actions secrets and the chapter-reciter variable.

## Data and learning quality
Qur’anic text and translations should be checked against a trusted mushaf and qualified teachers. The Amharic translation is retained from the supplied source and should be reviewed by a qualified Amharic-speaking Qur’an teacher. Browser-generated speech is not a substitute for qualified recitation instruction.


## Full-Qur’an synchronized recitation update

- The GitHub Actions workflow requests chapter audio and `segments=true` timing data for every chapter number from 1 to 114. Quran Foundation documents each word timing as a one-based `[word_index, start_ms, end_ms]` tuple.
- The website includes a full-Qur’an synchronized player with a surah selector, ayah selector, play/pause/stop controls, and live Arabic word highlighting.
- Run **Actions → Update Quran recitation data → Run workflow** after upload. The generated `data/recitation/index.json` reports the exact chapters with available word-level timings. A chapter can be unavailable if the selected chapter-reciter has no timing segments for it.
- `QF_CHAPTER_RECITER_ID` must be the chapter-reciter ID from Quran Foundation's `/resources/chapter_reciters` resource, not an ayah-by-ayah recitation ID. Keep `QF_CLIENT_ID` and `QF_CLIENT_SECRET` in GitHub Actions Secrets. Optionally set `QF_RECITER_NAME` in Actions Variables.
- Audio and timing are Quran Foundation content. Review the Quran Foundation Developer Terms for permitted caching, storage, and redistribution before publishing generated files.


## 2026 interface and feed update
- Deep emerald, warm ivory and brushed-gold styling is applied consistently across the responsive interface.
- The scroll feed progressively loads the 6,236 ayahs from the supplied dataset rather than rendering the entire Qur’an feed at once.
- Daily reading includes language facts, light jokes, Arabic proverbs and short hadith excerpts labelled with collection references.
- Tajweed practice includes active drills for articulation, ghunnah, qalqalah, madd, nūn sākinah, mīm sākinah, sun/moon letters and stopping.
- Device-generated Arabic speech is a practice aid only. It does not certify pronunciation or Tajweed.


## Native mobile interface refinement — November 2026

- Added a persistent five-destination mobile tab bar for Home, Learn, Reading Practice, Qur’an and Tajweed, with active-state feedback and safe-area spacing for iPhone devices.
- Refined section identity across Academy, Lessons, Repeat Practice, Recitation, Tajweed, Quizzes, Video Course, Resources and the full Qur’an reader using consistent icon marks and section labels.
- Unified button, card, panel, reader, quiz, lesson-tab and modal styling; improved touch targets, focus visibility, reduced-motion handling and small-screen layouts.
- Added responsive word-card styling in the full Qur’an reader and more consistent layouts for Tajweed drills and lesson navigation.
- Updated the service-worker cache to `ferhan-academy-v5` so installed copies can refresh the new interface.
- Existing Qur’an text, translations, learning content, audio workflow, local progress and privacy model are retained.

## V7 · Mushaf and memorisation studio

The Qur'an reader includes an optional Mushaf-style presentation, focus mode, adjustable Arabic type size, verse-level listen and recall-hide controls, and a local Hifz list. Learners can save ayahs, revisit the oldest review first, mark items as personally learned, remove items, and export their list as JSON. Hifz data is stored in this browser under `ferhanHifzStudioV7`; it is separate from the Quran text dataset and is not synced between devices. The service-worker cache is versioned `ferhan-academy-v7` so installed copies can receive the updated shell.


## V9 · synchronized word-by-word recitation

The full-surah player uses Quran Foundation chapter audio and its published word-level timing segments. While audio plays, the active Arabic word is highlighted and brought into view. Each word is also tappable to seek to that word's official start timestamp. The transport includes seeking, five-second skip, speed presets, play/pause, ayah previous/next, ayah replay, and optional current-ayah looping.

To publish timing data, configure repository secrets `QF_CLIENT_ID` and `QF_CLIENT_SECRET`, plus repository variable `QF_CHAPTER_RECITER_ID` (and optionally `QF_RECITER_NAME`). Run **Actions → Update Quran recitation data → Run workflow**. The workflow publishes `data/recitation/index.json` and per-surah JSON. Until the workflow has run successfully, the player reports timing data unavailable rather than inventing timestamps. Credentials are used only in GitHub Actions and are not included in the public app. Audio streaming requires internet access.

The service-worker shell cache is now `ferhan-academy-v8`; existing V7 Hifz and bookmark storage keys are deliberately retained so local progress is not discarded by this update.

## V9 visual refinement
- The Qur'an section opens in a Mushaf-inspired page layout with a surah title plate, basmala where appropriate, Arabic ayah flow, decorative ayah markers, and English/Amharic verse translations.
- Word-level audio pronunciation remains available by tapping an Arabic word. Tashkīl, translations, font sizing, recall hiding, bookmarking and Hifz actions remain available.
- The reader can switch between Mushaf view and compact word-card view.
- Mobile navigation is a five-destination, safe-area-aware iPhone-style bottom tab bar. The desktop top navigation remains unchanged.
- The rest of the learning sections retain their existing layouts; this release concentrates the major visual change in the Qur'an reader and improves contrast and navigation styling.
