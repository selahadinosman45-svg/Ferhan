// Runs only in GitHub Actions. Never include credentials in the website.
import { mkdir, writeFile } from "node:fs/promises";

const clientId = process.env.QF_CLIENT_ID;
const clientSecret = process.env.QF_CLIENT_SECRET;
const reciterId = process.env.QF_CHAPTER_RECITER_ID;
const scope = process.env.QF_SCOPE || "content.audio.read";

if (!clientId || !clientSecret || !reciterId) {
  throw new Error("Missing GitHub configuration. Set QF_CLIENT_ID and QF_CLIENT_SECRET secrets and QF_CHAPTER_RECITER_ID variable.");
}

const authBase = "https://oauth2.quran.foundation";
const apiBase = "https://apis.quran.foundation";

const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
const tokenResponse = await fetch(`${authBase}/oauth2/token`, {
  method: "POST",
  headers: {
    Authorization: `Basic ${basic}`,
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json"
  },
  body: new URLSearchParams({ grant_type: "client_credentials", scope })
});
if (!tokenResponse.ok) {
  const detail = (await tokenResponse.text()).slice(0, 400);
  throw new Error(`Quran Foundation OAuth failed (${tokenResponse.status}): ${detail}`);
}
const tokenPayload = await tokenResponse.json();
if (!tokenPayload.access_token) throw new Error("OAuth response did not include an access token.");

await mkdir("data/recitation", { recursive: true });

for (const chapter of [1, 112, 113, 114]) {
  const endpoint = `${apiBase}/content/api/v4/chapter_recitations/${encodeURIComponent(reciterId)}/${chapter}?segments=true`;
  const response = await fetch(endpoint, {
    headers: {
      "x-auth-token": tokenPayload.access_token,
      "x-client-id": clientId,
      Accept: "application/json"
    }
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 400);
    throw new Error(`Chapter ${chapter} request failed (${response.status}): ${detail}`);
  }
  const payload = await response.json();
  const audio = payload.audio_file || payload;
  if (!audio.audio_url || !Array.isArray(audio.timestamps)) {
    throw new Error(`Chapter ${chapter} did not return audio_url and timestamps. Verify the chapter-reciter ID and audio permission.`);
  }
  const timestamps = audio.timestamps.map(v => ({
    verse_key: v.verse_key,
    timestamp_from: v.timestamp_from,
    timestamp_to: v.timestamp_to,
    segments: Array.isArray(v.segments) ? v.segments : []
  }));
  if (!timestamps.some(v => v.segments.length)) {
    throw new Error(`Chapter ${chapter} returned no word-level timing segments. No approximate timings were generated.`);
  }
  const result = {
    chapter,
    audioUrl: audio.audio_url,
    reciterName: process.env.QF_RECITER_NAME || "Configured Quran Foundation reciter",
    timestamps,
    generatedAt: new Date().toISOString(),
    source: "Quran Foundation Content API"
  };
  await writeFile(`data/recitation/${chapter}.json`, JSON.stringify(result));
  console.log(`Saved verified chapter ${chapter} (${timestamps.length} verse timing records).`);
}
