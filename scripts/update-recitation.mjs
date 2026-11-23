// Runs only in GitHub Actions. Never expose Quran Foundation credentials in the website.
// Publishes one configured reciter's chapter audio and word-level timing data for all 114 surahs.
// Output is compatible with FERHAN V14:
//   data/recitation/index.json
//   data/recitation/{chapter}.json

import { mkdir, writeFile, rename } from "node:fs/promises";
import { dirname } from "node:path";

const clientId = process.env.QF_CLIENT_ID;
const clientSecret = process.env.QF_CLIENT_SECRET;
const reciterId = process.env.QF_CHAPTER_RECITER_ID;
const reciterName =
  process.env.QF_RECITER_NAME?.trim() || "Configured Quran Foundation reciter";
const scope = process.env.QF_SCOPE || "content.audio.read";

const authBase = "https://oauth2.quran.foundation";
const apiBase = "https://apis.quran.foundation";

if (!clientId || !clientSecret || !reciterId) {
  throw new Error(
    "Missing GitHub configuration. Set QF_CLIENT_ID and QF_CLIENT_SECRET secrets and QF_CHAPTER_RECITER_ID variable."
  );
}

const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
let accessToken;

async function getToken() {
  const response = await fetch(`${authBase}/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json"
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope
    })
  });

  if (!response.ok) {
    throw new Error(
      `Quran Foundation OAuth failed (${response.status}): ${(await response.text()).slice(0, 300)}`
    );
  }

  const payload = await response.json();
  if (!payload.access_token) {
    throw new Error("OAuth response did not include an access token.");
  }

  return payload.access_token;
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function fetchChapter(chapter) {
  const url =
    `${apiBase}/content/api/v4/chapter_recitations/` +
    `${encodeURIComponent(String(reciterId))}/${chapter}?segments=true`;

  for (let attempt = 0; attempt < 5; attempt++) {
    const response = await fetch(url, {
      headers: {
        "x-auth-token": accessToken,
        "x-client-id": clientId,
        Accept: "application/json"
      }
    });

    if (response.status === 401 && attempt < 4) {
      accessToken = await getToken();
      continue;
    }

    if ((response.status === 429 || response.status >= 500) && attempt < 4) {
      await sleep(Math.min(15000, 1000 * (2 ** attempt)));
      continue;
    }

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`
      );
    }

    return response.json();
  }

  throw new Error("Request retries exhausted.");
}

async function writeJsonAtomic(path, value) {
  await mkdir(dirname(path), { recursive: true });
  const temporaryPath = `${path}.tmp`;
  await writeFile(temporaryPath, JSON.stringify(value));
  await rename(temporaryPath, path);
}

function normalizeTimestamps(audio) {
  if (!Array.isArray(audio?.timestamps)) return [];

  return audio.timestamps.map(record => ({
    verse_key: String(record.verse_key || ""),
    timestamp_from: Number(record.timestamp_from),
    timestamp_to: Number(record.timestamp_to),
    segments: Array.isArray(record.segments)
      ? record.segments
          .filter(segment => Array.isArray(segment) && segment.length >= 3)
          .map(segment => [
            Number(segment[0]),
            Number(segment[1]),
            Number(segment[2])
          ])
      : []
  }));
}

function hasValidWordTimings(audioUrl, timestamps) {
  if (!audioUrl || timestamps.length === 0) return false;

  return timestamps.some(
    verse =>
      verse.verse_key &&
      verse.segments.length > 0 &&
      verse.segments.every(
        segment =>
          Number.isInteger(segment[0]) &&
          segment[0] > 0 &&
          Number.isFinite(segment[1]) &&
          Number.isFinite(segment[2]) &&
          segment[1] >= 0 &&
          segment[2] >= segment[1]
      )
  );
}

accessToken = await getToken();
await mkdir("data/recitation", { recursive: true });

const availableChapters = [];
const unavailableChapters = [];

const manifest = {
  source: "Quran Foundation Content API",
  generatedAt: new Date().toISOString(),
  totalChapters: 114,

  // FERHAN V14 reads this one-reciter catalogue to populate its reciter selector.
  defaultReciterId: String(reciterId),
  chapterPath: "./data/recitation/{chapter}.json",
  reciters: [
    {
      id: String(reciterId),
      name: reciterName,
      reciterName,
      default: true,
      chapterPath: "./data/recitation/{chapter}.json",
      availableChapters,
      unavailableChapters
    }
  ],

  // Legacy/top-level fields are retained for older FERHAN builds.
  reciterId: String(reciterId),
  reciterName,
  availableChapters,
  unavailableChapters
};

for (let chapter = 1; chapter <= 114; chapter++) {
  try {
    const payload = await fetchChapter(chapter);
    const audio = payload?.audio_file || payload;
    const audioUrl = audio?.audio_url || null;
    const timestamps = normalizeTimestamps(audio);
    const valid = hasValidWordTimings(audioUrl, timestamps);

    const reason = valid
      ? null
      : "This chapter-reciter response did not contain a playable chapter audio URL and valid word-level timing segments.";

    const result = {
      chapter,
      available: valid,
      audioUrl,
      reciterId: String(reciterId),
      reciterName,
      timestamps,
      generatedAt: new Date().toISOString(),
      source: "Quran Foundation Content API",
      reason
    };

    await writeJsonAtomic(`data/recitation/${chapter}.json`, result);

    if (valid) {
      availableChapters.push(chapter);
    } else {
      unavailableChapters.push({ chapter, reason });
    }

    console.log(
      `${valid ? "OK" : "NO WORD TIMINGS"} · Chapter ${chapter} · ${timestamps.length} verse records`
    );
  } catch (error) {
    const reason = String(error?.message || error).slice(0, 500);
    const result = {
      chapter,
      available: false,
      audioUrl: null,
      reciterId: String(reciterId),
      reciterName,
      timestamps: [],
      generatedAt: new Date().toISOString(),
      source: "Quran Foundation Content API",
      reason
    };

    await writeJsonAtomic(`data/recitation/${chapter}.json`, result);
    unavailableChapters.push({ chapter, reason });
    console.error(`FAILED · Chapter ${chapter} · ${reason}`);
  }

  if (chapter < 114) await sleep(350);
}

// Refresh manifest references after the loop; the arrays above are shared with
// the single reciter entry, so both views contain the same coverage information.
manifest.generatedAt = new Date().toISOString();
await writeJsonAtomic("data/recitation/index.json", manifest);

console.log(
  `Finished: ${availableChapters.length}/114 chapters have verified word-level timing for ${reciterName}.`
);

if (availableChapters.length === 0) {
  throw new Error(
    "No chapters returned word-level timing. Check the configured chapter-reciter ID, approved content.audio.read permission, and reciter coverage."
  );
}
