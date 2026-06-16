# RFC-002: Automated background music via Epidemic Sound (MCP + API key)

**Status:** PROPOSAL (v2 — replaces the Pixabay-based proposal)
**Author:** khriztian
**Date:** June 15, 2026
**Project:** video-dev-tips-remotion (Remotion Video Core)

---

## 1. Goal

Define a pre-render (AOT) module that **searches, trims, downloads and persists**
licensed music tracks from **Epidemic Sound**, and automatically injects background
music into the videos generated with Remotion — without hurting render latency and
keeping a decoupled local schema.

## 2. Why Epidemic Sound (and not Pixabay)

The original proposal (RFC-002 v1) targeted Pixabay, but **Pixabay does not expose a
music API** (its [REST API](https://pixabay.com/api/docs/) only covers images and
video). It is ruled out as a programmatic source.

Epidemic Sound does offer a programmatic surface (MCP server) with mood-based search,
custom-length trimming and direct download. It is **paid by subscription**; that is
the key licensing difference (see §8).

### 2.1 Advantages of paying for the license (for this pipeline)

| Advantage                                          | Why it matters here                                                                                                                                                                                                                   |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Clearance on your own channels (no Content ID)** | You connect your channels (YouTube/TikTok/IG) to the account; content published while the subscription is active stays _cleared forever_. Zero copyright claims that could nuke monetization — the biggest risk for automated content |
| **Rich semantic search**                           | `search_music` filters by **mood, BPM, duration, instruments, key, vocals** → perfect for mapping `bgMusicMood` to a deterministic query                                                                                              |
| **Trim to the exact duration**                     | `edit_recordings_for_custom_lengths` adjusts the track to the video length (which is **dynamic** here: timeline + outro), avoiding ugly loops/cuts                                                                                    |
| **Individual stems**                               | Stem download → enables _ducking_ (lowering the music under the voiceover) and fine mixing                                                                                                                                            |
| **Unlimited downloads, WAV + MP3**                 | Batch pipeline without quotas; render-grade quality                                                                                                                                                                                   |
| **SFX and voice generation in the same MCP**       | Synergy: the same integration could later drive the `audioUrl` (voiceover) and transition SFX                                                                                                                                         |
| **`find_similar_track`**                           | Audible consistency across videos in a series (auditory brand identity)                                                                                                                                                               |

## 3. Authentication: API key (programmatic access)

We use an **API key**, not OAuth, to allow headless execution (script/CI).

- Generate the key at `https://www.epidemicsound.com/account/api-keys`.
- **Expires after 30 days** → must be rotated and re-exported periodically.
- Store it in an environment variable, never hardcode it:
  ```bash
  export EPIDEMIC_SOUND_API_KEY="..."
  ```
- MCP endpoint (HTTP): `https://www.epidemicsound.com/a/mcp-service/mcp`
- Header: `Authorization: Bearer ${EPIDEMIC_SOUND_API_KEY}`

> The MCP server is in **Beta**. For licensing questions: `mcp@epidemicsound.com`.

## 4. Architecture (AOT pre-fetching, headless via MCP/HTTP)

Since the endpoint is HTTP, a Node script connects as an MCP client using the
official SDK (`@modelcontextprotocol/sdk`, `StreamableHTTPClientTransport`) with the
authorization header. No interactive AI client is required.

> ### ✅ Phase 1 VALIDATED (spike `scripts/spike-epidemic.ts`, 2026-06-15)
>
> Connection + Bearer auth OK. **The names from the docs (`search_music`, `download_music_track`,
> `edit_recordings_for_custom_lengths`) DO NOT exist.** The MCP is a **GraphQL gateway**
> with meta-tools (`introspect`, `search`, `validate`, `execute`) and the actual
> high-level tools:
>
> | What we need                | Real tool                                                                               | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
> | --------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
> | Search music by mood        | `execute` → `recordings(filter: RecordingsFilter)`                                      | ⚠️ The high-level `SearchRecordings` tool **ignores `searchTerm`** (returns the same set for any term — verified). Filter for real via `taxonomySlugs` (genre), `moodSlugs`, `bpm`, `duration` (`FilterStringValues { matchType: ALL\|ANY\|NOT_ANY, values }`). Confirmed genre slugs: `lo-fi-hip-hop`, `lo-fi-house`, `ambient`, `synthwave`. Returns `nodes[].recording` with `id`, `title`, `bpm`, `audioFile.durationInMilliseconds`/`lqmp3Url` (preview), `stems`, `tags` |
> | Similar to a track          | `SearchSimilarToRecording`                                                              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
> | **Download licensed asset** | `DownloadRecording`                                                                     | args include `id`, `fileType: MP3\|WAV`, `stem: FULL\|BASS\|DRUMS\|INSTRUMENTS`; returns `RecordingDownload.assetUrl` (HQ)                                                                                                                                                                                                                                                                                                                                                     |
> | Custom-length trim          | `EditRecording` → `PollEditRecordingJob` → `DownloadRecordingEdit`                      | asynchronous (job)                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
> | (bonus) TTS/voice           | `ListVoices`, `GenerateVoiceover`, `PollVoiceoverGenerationStatus`, `DownloadVoiceover` | useful for `audioUrl` (voiceover) in the future                                                                                                                                                                                                                                                                                                                                                                                                                                |
>
> ⚠️ **`lqmp3Url` is preview only** — DO NOT publish using it. The licensed asset is
> obtained with `DownloadRecording` (`assetUrl`).

```
scripts/fetch-music.ts (new)
  └─ for every topic with bgMusicMood:
     1. is there already a cached track for (topicId)? → yes: skip (idempotent)
     2. execute `recordings(filter: { taxonomySlugs: { matchType: ALL, values: [MOOD_TAXONOMY[mood]] } }, first: N)`
        (the high-level SearchRecordings tool IGNORES searchTerm — see §4 finding)
     3. pick the best one (closest duration >= video length)
     4. (depending on duration) EditRecording → PollEditRecordingJob → DownloadRecordingEdit
        · or, if no trimming, DownloadRecording({ id, fileType: MP3, stem: FULL })
     5. download the binary from assetUrl → public/music/<mood>/<id>.mp3  (gitignored)
     6. upsert into the manifest (see §6)
```

It runs **before** `dev`/`render` (`prerender`-style hook, just like `codegen`), or
manually. The render never hits the network.

### 4.1 MCP client sketch (illustrative, not final)

```ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const transport = new StreamableHTTPClientTransport(
  new URL("https://www.epidemicsound.com/a/mcp-service/mcp"),
  {
    requestInit: {
      headers: {
        Authorization: `Bearer ${process.env.EPIDEMIC_SOUND_API_KEY}`,
      },
    },
  },
);
const client = new Client({ name: "video-dev-tips", version: "1.0.0" });
await client.connect(transport);
// searchTerm is ignored — filter by the real genre taxonomy slug via `execute`:
const res = await client.callTool({
  name: "execute",
  arguments: {
    query:
      "query($f: RecordingsFilter!, $n: Int!) { recordings(filter: $f, first: $n) { nodes { recording { id title audioFile { durationInMilliseconds } } } } }",
    variables: JSON.stringify({
      f: { taxonomySlugs: { matchType: "ALL", values: [MOOD_TAXONOMY[mood]] } },
      n: 12,
    }),
  },
});
```

lo-fi-hip-hop

## 5. Type spec (corrected)

Changes vs. RFC v1 (which broke the current code):

```ts
// src/types/content.ts
export type BgMusicMood =
  | "lo-fi-hip-hop"
  | "lofi-house"
  | "ambient-tech"
  | "synthwave-cyberpunk";

export type TopicMetadata = {
  id: string;
  version: string;
  category: string; // STAYS as string — "categories are folders"
  displayTitle: string;
  theme?: Partial<Theme>;
  ctaQuestion?: string;
  bgMusicMood?: BgMusicMood; // OPTIONAL — does not break existing topics
  timeline: VideoStep[];
};
```

- `bgMusicMood` is **optional**: without it, the global music from `src/audio.ts` is
  used (fallback) or none.
- We **do NOT** narrow `category` to a union (it would break filesystem-based
  auto-discovery).
- There is **no** `bgMusicPath` in the type: the resolved path lives in the manifest
  (§6); we do not mutate the topic `.ts` file (no AST source rewriting).
- `MOOD_TAXONOMY: Record<BgMusicMood, string>` maps each mood to a real genre taxonomy
  slug (e.g. `lo-fi-hip-hop`, `lo-fi-house`, `ambient`, `synthwave`), used in the
  `recordings(filter: { taxonomySlugs })` query — free-text search is ignored by the catalog.

## 6. Sidecar manifest (instead of mutating the `.ts`)

The script writes a generated manifest that the render reads to resolve the per-topic
track:

```jsonc
// src/_generated/music-manifest.json  (gitignored — references licensed assets)
{
  "tips--devtools-network--v1": {
    "mood": "ambient-tech",
    "file": "music/ambient-tech/es_abc123.mp3",
    "trackId": "es_abc123",
    "fetchedAt": "2026-06-15T22:00:00Z",
  },
}
```

Per topic, the render resolves: `manifest[id].file` → `staticFile(...)`. If there is
no entry, it falls back to the global default.

## 7. Render integration

- `ShortVideoLayout` already mounts the global music (`src/audio.ts`). We add
  **precedence**: per-topic manifest music > global music > none.
- Low volume (5–8%) and `loop` only when `edit_recordings_for_custom_lengths` was not
  used.
- Future: _ducking_ under the voiceover using stems or by lowering the volume in
  scenes that have `audioUrl`.

## 8. Licensing and compliance (CRITICAL)

Epidemic Sound differs radically from Pixabay:

- The license is valid **only while the subscription is active** and is **tied to the
  channels registered** with the account. Each output channel must be connected.
- Commercial scale → **Pro/business** plan.
- **Do not commit MP3s/manifest to the repo** (it would be redistribution):
  `public/music/` and `src/_generated/music-manifest.json` go to `.gitignore`.
- **Do not reuse cached tracks if the subscription expires.** The cache is valid only
  under an active subscription.
- Do not sublicense or redistribute to third parties outside the personal/Pro terms.

## 9. Idempotency, caching and reproducibility

- The script is idempotent by `(mood)` or by `(topicId)`: if there is already a valid
  track in the manifest, it does not re-download.
- Deterministic selection (stable order by popularity/match) so two runs return the
  same track, unless `--refresh`.
- `--refresh` forces a re-fetch (e.g. when the catalog changes).

## 10. Risks and mitigations

| Risk                                         | Mitigation                                                                     |
| -------------------------------------------- | ------------------------------------------------------------------------------ |
| API key expires after 30 days                | Document rotation; the script fails with a clear message if the key is invalid |
| MCP in Beta (tool changes)                   | Isolate MCP calls in a single `scripts/lib/epidemic.ts` module                 |
| Subscription expires → unlicensed assets     | Gitignored cache + explicit note; do not depend on old tracks                  |
| MCP transport (HTTP/SSE) not 100% documented | Validate with a spike before Phase 2; the SDK abstracts the transport          |
| No network in render CI                      | Fetch is a separate prior step; the render runs offline                        |

## 11. Implementation phases

1. ~~**Spike**~~ ✅ DONE (`scripts/spike-epidemic.ts`) — real tools confirmed (§4).
2. ~~**Types + manifest**~~ ✅ `bgMusicMood?`, `MOOD_QUERIES`, manifest reader, `.gitignore`.
3. ~~**`fetch-music.ts` script**~~ ✅ search + download validated end-to-end (audio confirmed
   in the rendered MP4 via `ffprobe`).
4. ~~**Render:** per-topic precedence in `ShortVideoLayout`.~~ ✅
5. ~~**Skill:** document `bgMusicMood`.~~ ✅
6. **Custom-length trim (`EditRecording`):** ⚠️ IMPLEMENTED but inert on this account.
   The async flow is built (submit `EditRecording` → poll via the generic `execute` tool
   selecting `edits { id }` → `DownloadRecordingEdit`). On the **Creator** plan the job
   reaches `COMPLETED` but returns **`edits: []`** for every input variant tried
   (`loopable` on/off, `forceDuration: true`). Conclusion: the trim/edit feature is **not
   entitled on Creator** (likely Pro or a separate feature) or is server-gated. The script
   **falls back to the full track + `loop`** (validated). The code is ready to work the
   moment edits are returned. Action: confirm the edit entitlement with
   `mcp@epidemicsound.com` / the plan, then re-run `pnpm fetch-music --refresh`.
7. **(Optional) ducking / stems / SFX / voice** as a follow-up.

## 12. Decisions (closed)

- **Plan: Creator.** Covers the creator's own online content with unlimited downloads.
  The license applies to the owner's channels connected to the account (no
  sublicensing to third parties — if clients/brands appear in the future, Pro is
  re-evaluated).
- **Trimming: both, depending on the video length.** Prefer
  `edit_recordings_for_custom_lengths` to fit the track to the total (dynamic)
  duration. If the duration falls outside the track's editable range, fall back to
  `loop`/trim.
- **Mood per topic** (not per scene). One track per video, via `bgMusicMood`.
- **Spike first (Phase 1):** confirm the MCP HTTP transport + the response shape of
  `search_music` before committing to the fetch script.
