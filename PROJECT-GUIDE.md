# FERHAN integrated learning academy

This folder is the deployable static website.

## Main learning areas
- Home dashboard and learner progress
- Academy roadmap and staged Arabic foundations
- Lessons and vertical swipe/scroll micro-lessons
- Repeat-and-practise reading exercises
- Qur’an reading and word-by-word study
- Tajweed reference and quizzes
- Video-course/resource area
- Recitation playback and synchronized word timing for configured short surahs

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
