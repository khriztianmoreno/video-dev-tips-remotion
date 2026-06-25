/**
 * RFC-002 — AOT music pre-fetch (Epidemic Sound, MCP + API key).
 *
 * For every topic with `bgMusicMood`, searches Epidemic Sound, downloads a licensed MP3
 * into `public/music/<mood>/`, and writes `src/_generated/music-manifest.ts`. The render
 * never touches the network; it just reads the manifest.
 *
 * Usage:
 *   # Reads EPIDEMIC_SOUND_API_KEY from `.env` (auto-loaded) or the shell env.
 *   pnpm fetch-music            # idempotent: skips topics already in the manifest
 *   pnpm fetch-music --refresh  # re-fetch even if already present
 *
 * NOTE: downloaded tracks are licensed only while the subscription is active and are
 * gitignored (public/music/). Do not commit or redistribute them.
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { globSync } from "glob";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve as resolvePath } from "node:path";
import { pathToFileURL } from "node:url";

// Load `.env` (gitignored) if present. Node 22+ has `loadEnvFile` built-in, so
// no `dotenv` dependency is needed. Variables already in the shell take precedence.
const ENV_FILE = resolvePath(".env");
if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);
import type { TopicMetadata } from "../src/types/content";
import {
  DEFAULT_BG_MUSIC_MOOD,
  MOOD_TAXONOMY,
  topicKey,
  type MusicManifest,
} from "../src/music";
import { outroStep } from "../src/outro";

const MCP_URL = "https://www.epidemicsound.com/a/mcp-service/mcp";
const MANIFEST_FILE = "src/_generated/music-manifest.ts";
const REFRESH = process.argv.includes("--refresh");
// Optional positional topic key (e.g. `tips--devtools-network--v1`) to re-fetch ONLY that
// topic with a brand-new track (deduped against every track already in the manifest).
const ONLY = process.argv.slice(2).find((a) => !a.startsWith("-")) ?? null;

const apiKey = process.env.EPIDEMIC_SOUND_API_KEY;
if (!apiKey) {
  console.error(
    "\n❌ Missing EPIDEMIC_SOUND_API_KEY (https://www.epidemicsound.com/account/api-keys).\n",
  );
  process.exit(1);
}

/** Extract the GraphQL `data` payload from an MCP tool result, throwing on errors. */
const toolData = (res: unknown): any => {
  const content = (res as { content?: { text?: string }[] })?.content;
  const text = content?.[0]?.text;
  if (!text) throw new Error("Empty tool result");
  const json = JSON.parse(text);
  if (json.errors) throw new Error(`GraphQL: ${JSON.stringify(json.errors)}`);
  return json.data;
};

/** Recursively find the first value for `key` anywhere in an object tree. */
const deepFind = (obj: unknown, key: string): unknown => {
  if (!obj || typeof obj !== "object") return undefined;
  for (const [k, v] of Object.entries(obj)) {
    if (k === key) return v;
    const nested = deepFind(v, key);
    if (nested !== undefined) return nested;
  }
  return undefined;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const EDIT_STATUSES = new Set([
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "FAILED",
]);

/** Find the RecordingEditJob object (the first node carrying a known `status`). */
const findJob = (obj: any): any => {
  if (!obj || typeof obj !== "object") return undefined;
  if (typeof obj.status === "string" && EDIT_STATUSES.has(obj.status))
    return obj;
  for (const v of Object.values(obj)) {
    const found = findJob(v);
    if (found) return found;
  }
  return undefined;
};

/**
 * Trim a recording to the exact video length via the async EditRecording job, and return
 * the licensed asset URL. Throws on failure so the caller can fall back to the full track.
 */
async function editToLength(
  client: Client,
  recordingId: string,
  targetMs: number,
): Promise<string> {
  const submit = toolData(
    await client.callTool({
      name: "EditRecording",
      arguments: {
        id: recordingId,
        input: {
          targetDurationMs: Math.min(Math.round(targetMs), 300000),
          loopable: true,
          forceDuration: true,
          downloadAudioFormat: "MP3",
          skipStems: true,
          maxResults: 1,
        },
      },
    }),
  );
  const jobId = findJob(submit)?.id;
  if (!jobId) throw new Error("EditRecording no devolvió jobId");

  // The high-level PollEditRecordingJob tool returns `edit: null` (deprecated) and omits
  // `edits`, so we poll via the generic `execute` tool selecting `edits { id }` explicitly.
  const POLL_QUERY =
    "query Poll($id: UUID!) { recordingEditJob(id: $id) { id status edits { id durationMs } } }";

  for (let i = 0; i < 30; i++) {
    const pollData = toolData(
      await client.callTool({
        name: "execute",
        arguments: {
          query: POLL_QUERY,
          variables: JSON.stringify({ id: jobId }),
        },
      }),
    );
    const job = pollData?.recordingEditJob ?? findJob(pollData);
    if (job?.status === "COMPLETED") {
      if (process.env.DEBUG_EDIT)
        console.error("[debug] COMPLETED job:", JSON.stringify(job));
      const editId = Array.isArray(job?.edits)
        ? job.edits[0]?.id
        : job?.edit?.id;
      if (!editId) throw new Error("Edit COMPLETED sin editId");
      const url = deepFind(
        toolData(
          await client.callTool({
            name: "DownloadRecordingEdit",
            arguments: { input: { jobId, editId } },
          }),
        ),
        "assetUrl",
      );
      if (typeof url !== "string") throw new Error("Edit sin assetUrl");
      return url;
    }
    if (job?.status === "FAILED") throw new Error("Edit job FAILED");
    await sleep(2000);
  }
  throw new Error("Edit job timeout");
}

/**
 * Load every content file (`content/<category>/<topic>/v<n>/<format>.ts`) and
 * deduplicate by `topicKey` — the music manifest is keyed per topic-version, not
 * per format, so we want ONE representative TopicMetadata per `<cat>--<id>--<ver>`.
 * When multiple formats exist for the same version we prefer the one with the
 * longest timeline so the picked track covers every format.
 */
const loadTopics = async (): Promise<TopicMetadata[]> => {
  const files = globSync("content/*/*/v*/*.ts").sort();
  const byKey = new Map<string, TopicMetadata>();
  for (const f of files) {
    const mod = await import(pathToFileURL(resolvePath(f)).href);
    const data = mod.data as TopicMetadata | undefined;
    if (!data) continue;
    const key = topicKey(data.category, data.id, data.version);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, data);
      continue;
    }
    const existingDuration = existing.timeline.reduce(
      (a, s) => a + s.durationInSeconds,
      0,
    );
    const candidateDuration = data.timeline.reduce(
      (a, s) => a + s.durationInSeconds,
      0,
    );
    if (candidateDuration > existingDuration) byKey.set(key, data);
  }
  return [...byKey.values()];
};

const loadManifest = async (): Promise<MusicManifest> => {
  try {
    const mod = await import(
      `${pathToFileURL(resolvePath(MANIFEST_FILE)).href}?t=${Date.now()}`
    );
    return { ...(mod.musicManifest as MusicManifest) };
  } catch {
    return {};
  }
};

async function main() {
  // Every topic gets music: its own bgMusicMood, or the default (lo-fi-hip-hop).
  let topics = await loadTopics();
  if (ONLY) {
    topics = topics.filter((t) => topicKey(t.category, t.id, t.version) === ONLY);
    if (topics.length === 0) {
      console.error(`No topic matches "${ONLY}".`);
      process.exit(1);
    }
  }
  if (topics.length === 0) {
    console.log("No topics found. Nothing to do.");
    return;
  }

  const manifest = await loadManifest();
  // Track recordings already used (incl. previously cached) so each topic gets a
  // DIFFERENT track even when topics share the same mood/genre.
  const used = new Set<string>(
    Object.values(manifest).map((e) => e.recordingId)
  );

  const transport = new StreamableHTTPClientTransport(new URL(MCP_URL), {
    requestInit: { headers: { Authorization: `Bearer ${apiKey}` } },
  });
  const client = new Client({
    name: "video-dev-tips-fetch-music",
    version: "1.0.0",
  });
  await client.connect(transport);

  let failures = 0;
  for (const topic of topics) {
    const key = topicKey(topic.category, topic.id, topic.version);
    if (topic.bgMusicFile) {
      console.log(`↷ ${key} pinned to ${topic.bgMusicFile}. Skip.`);
      continue;
    }
    if (manifest[key] && !REFRESH && key !== ONLY) {
      console.log(`↷ ${key} already has music (${manifest[key].title}). Skip.`);
      continue;
    }

    const oldFile = manifest[key]?.file;
    try {
      await fetchForTopic(client, manifest, topic, used);
      const newFile = manifest[key]?.file;
      if (oldFile && newFile && oldFile !== newFile) {
        try {
          rmSync(`public/${oldFile}`);
          console.log(`  🧹 removed orphan ${oldFile}`);
        } catch {
          /* ignore */
        }
      }
    } catch (err) {
      failures++;
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`  ⚠️  ${key} failed: ${msg}`);
      if (/recordingDownload|INTERNAL_SERVER_ERROR/i.test(msg)) {
        console.warn(
          "     ↳ Downloading the asset usually requires an ACTIVE Epidemic Sound\n" +
            "       SUBSCRIPTION (search works without one). Check your plan and retry.",
        );
      }
    }
  }

  await client.close();
  writeManifest(manifest);
  if (failures > 0) process.exitCode = 1;
}

async function fetchForTopic(
  client: Client,
  manifest: MusicManifest,
  topic: TopicMetadata,
  used: Set<string>,
): Promise<void> {
  {
    const key = topicKey(topic.category, topic.id, topic.version);
    const mood = topic.bgMusicMood ?? DEFAULT_BG_MUSIC_MOOD;
    const videoMs =
      (topic.timeline.reduce((a, s) => a + s.durationInSeconds, 0) +
        outroStep.durationInSeconds) *
      1000;

    // Free-text searchTerm is ignored by the catalog — filter by the real genre slug.
    const slug = MOOD_TAXONOMY[mood];
    console.log(`\n→ ${key} — filtering genre "${slug}"…`);
    const SEARCH_QUERY =
      "query($f: RecordingsFilter!, $first: Int!) { recordings(filter: $f, first: $first) { nodes { recording { id title audioFile { durationInMilliseconds } } } } }";
    const searchData = toolData(
      await client.callTool({
        name: "execute",
        arguments: {
          query: SEARCH_QUERY,
          variables: JSON.stringify({
            f: { taxonomySlugs: { matchType: "ALL", values: [slug] } },
            first: 12,
          }),
        },
      }),
    );
    const nodes: any[] = (searchData?.recordings?.nodes ?? []).map(
      (n: any) => n.recording,
    );
    if (nodes.length === 0) {
      console.warn(`  ⚠️  No results for ${mood}. Skip.`);
      return;
    }

    // Skip recordings already taken by another topic, so each video differs.
    const pool = nodes.filter((r) => !used.has(r.id));
    const candidates = pool.length ? pool : nodes;

    // Prefer a track at least as long as the video; else the longest available.
    const longEnough = candidates.filter(
      (r) => (r.audioFile?.durationInMilliseconds ?? 0) >= videoMs,
    );
    const pick =
      longEnough[0] ??
      candidates.reduce((a, b) =>
        (b.audioFile?.durationInMilliseconds ?? 0) >
        (a.audioFile?.durationInMilliseconds ?? 0)
          ? b
          : a,
      );
    used.add(pick.id);

    console.log(`  ♪ "${pick.title}" (${pick.id})`);

    // Prefer an exact-length, loopable edit; fall back to the full track + loop.
    let assetUrl: string | undefined;
    let exact = false;
    try {
      assetUrl = await editToLength(client, pick.id, videoMs);
      exact = true;
      console.log(`  ✂️  edit a ${(videoMs / 1000).toFixed(0)}s`);
    } catch (e) {
      console.warn(
        `  ⚠️  edit no disponible (${e instanceof Error ? e.message : e}); pista completa + loop`,
      );
      assetUrl = deepFind(
        toolData(
          await client.callTool({
            name: "DownloadRecording",
            arguments: {
              id: pick.id,
              options: { fileType: "MP3", stemType: "FULL" },
            },
          }),
        ),
        "assetUrl",
      ) as string | undefined;
    }
    if (typeof assetUrl !== "string") {
      console.warn("  ⚠️  No assetUrl returned. Skip.");
      return;
    }

    const rel = `music/${mood}/${pick.id}${exact ? "-edit" : ""}.mp3`;
    mkdirSync(`public/music/${mood}`, { recursive: true });
    const buf = Buffer.from(await (await fetch(assetUrl)).arrayBuffer());
    writeFileSync(`public/${rel}`, buf);
    console.log(`  ⬇️  ${rel} (${(buf.length / 1024 / 1024).toFixed(1)} MB)`);

    manifest[key] = {
      mood,
      file: rel,
      recordingId: pick.id,
      title: pick.title,
      exact,
    };
  }
}

function writeManifest(manifest: MusicManifest): void {
  const banner =
    "// AUTO-GENERATED by scripts/fetch-music.ts — do not edit by hand.";
  mkdirSync("src/_generated", { recursive: true });
  writeFileSync(
    MANIFEST_FILE,
    `${banner}\nimport type { MusicManifest } from '../music';\n\n` +
      `export const musicManifest: MusicManifest = ${JSON.stringify(manifest, null, 2)};\n`,
  );
  console.log(`\n✅ Manifest updated: ${MANIFEST_FILE}`);
}

main().catch((err) => {
  console.error(
    "\n❌ fetch-music failed:",
    err instanceof Error ? err.message : err,
  );
  process.exit(1);
});
