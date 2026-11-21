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
