// Runs only in GitHub Actions. Never include credentials in the website.
// Downloads chapter audio and authentic word-level timing segments for all 114 surahs.
import { mkdir, writeFile } from "node:fs/promises";

const clientId = process.env.QF_CLIENT_ID;
const clientSecret = process.env.QF_CLIENT_SECRET;
const reciterId = process.env.QF_CHAPTER_RECITER_ID;
const scope = process.env.QF_SCOPE || "content.audio.read";
const authBase = "https://oauth2.quran.foundation";
const apiBase = "https://apis.quran.foundation";
if (!clientId || !clientSecret || !reciterId) throw new Error("Missing GitHub configuration. Set QF_CLIENT_ID and QF_CLIENT_SECRET secrets and QF_CHAPTER_RECITER_ID variable.");

const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
let accessToken;
async function getToken() {
  const response = await fetch(`${authBase}/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({ grant_type: "client_credentials", scope })
  });
  if (!response.ok) throw new Error(`Quran Foundation OAuth failed (${response.status}): ${(await response.text()).slice(0, 300)}`);
  const payload = await response.json();
  if (!payload.access_token) throw new Error("OAuth response did not include an access token.");
  return payload.access_token;
}
accessToken = await getToken();
await mkdir("data/recitation", { recursive: true });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function fetchChapter(chapter) {
  const url = `${apiBase}/content/api/v4/chapter_recitations/${encodeURIComponent(reciterId)}/${chapter}?segments=true`;
  for (let attempt = 0; attempt < 5; attempt++) {
    const response = await fetch(url, { headers: { "x-auth-token": accessToken, "x-client-id": clientId, Accept: "application/json" } });
    if (response.status === 401 && attempt < 4) { accessToken = await getToken(); continue; }
    if (response.status === 429 || response.status >= 500) {
      if (attempt < 4) { await sleep(Math.min(15000, 1000 * (2 ** attempt))); continue; }
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`);
    return response.json();
  }
  throw new Error("Request retries exhausted.");
}

const manifest = { source: "Quran Foundation Content API", reciterId: String(reciterId), reciterName: process.env.QF_RECITER_NAME || "Configured Quran Foundation reciter", generatedAt: new Date().toISOString(), totalChapters: 114, availableChapters: [], unavailableChapters: [] };
for (let chapter = 1; chapter <= 114; chapter++) {
  try {
    const payload = await fetchChapter(chapter);
    const audio = payload.audio_file || payload;
    const timestamps = Array.isArray(audio.timestamps) ? audio.timestamps.map(v => ({
      verse_key: v.verse_key,
      timestamp_from: Number(v.timestamp_from),
      timestamp_to: Number(v.timestamp_to),
      segments: Array.isArray(v.segments) ? v.segments.map(s => [Number(s[0]), Number(s[1]), Number(s[2])]) : []
    })) : [];
    const valid = Boolean(audio.audio_url) && timestamps.length > 0 && timestamps.some(v => v.segments.length > 0 && v.segments.every(s => s.length === 3 && s[0] > 0 && s[2] >= s[1]));
    const result = { chapter, available: valid, audioUrl: audio.audio_url || null, reciterName: manifest.reciterName, timestamps, generatedAt: new Date().toISOString(), source: "Quran Foundation Content API", reason: valid ? null : "This chapter-reciter response did not contain a playable chapter audio URL and word-level timing segments." };
    await writeFile(`data/recitation/${chapter}.json`, JSON.stringify(result));
    if (valid) manifest.availableChapters.push(chapter);
    else manifest.unavailableChapters.push({ chapter, reason: result.reason });
    console.log(`${valid ? "OK" : "NO WORD TIMINGS"} · Chapter ${chapter} · ${timestamps.length} verse records`);
  } catch (error) {
    const result = { chapter, available: false, audioUrl: null, reciterName: manifest.reciterName, timestamps: [], generatedAt: new Date().toISOString(), source: "Quran Foundation Content API", reason: String(error.message || error).slice(0, 500) };
    await writeFile(`data/recitation/${chapter}.json`, JSON.stringify(result));
    manifest.unavailableChapters.push({ chapter, reason: result.reason });
    console.error(`FAILED · Chapter ${chapter} · ${result.reason}`);
  }
  if (chapter < 114) await sleep(350);
}
await writeFile("data/recitation/index.json", JSON.stringify(manifest, null, 2));
console.log(`Finished: ${manifest.availableChapters.length}/114 chapters have verified word-level timing.`);
if (manifest.availableChapters.length === 0) throw new Error("No chapters returned word-level timing. Check the chapter-reciter ID, approved content.audio.read permission, and reciter coverage.");
