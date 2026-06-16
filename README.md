# video-dev-tips-remotion

A data-driven generator for short-form technical videos (YouTube Shorts, Reels, TikTok) built with [Remotion](https://www.remotion.dev/). Each topic is described as a plain TypeScript object — the visual layout consumes the data and produces a 1080×1920 vertical video.

## Why this exists

Creating short technical videos by hand is repetitive: same intro, same layout, same export settings. This project flips the workflow around: **content is the source of truth**, the visual layer is a stateless renderer. To publish a new tip you write a `.ts` file. To revise an existing one you bump its version. Git tracks every iteration.

## Features

- **Single source of truth in `content/`.** One folder per topic, one file per version (`v1.ts`, `v2.ts`, …). Compositions are discovered automatically.
- **Strict types.** Every video must satisfy the `TopicMetadata` contract — no malformed payloads slip through.
- **Auto-discovery via codegen.** A pre-hook (`predev`, `prebuild`, `prerender`) regenerates the topic index from the filesystem. No manual import lists.
- **Dynamic duration.** `calculateMetadata` sums the `timeline` of each topic so the composition length always matches the data — you never hand-tune `durationInFrames`.
- **Versioning as folders.** Side-by-side versions live in the same topic folder; the Remotion Studio shows them as independent compositions.
- **Syntax-highlighted code with typewriter animation.** `prism-react-renderer` + frame-driven slicing.
- **Google Fonts baked in.** Inter for UI, JetBrains Mono for code, loaded via `@remotion/google-fonts`.
- **Brand identity baked in.** A central `Theme` provides the default brand palette and topics can override any subset with `Partial<Theme>`. The brand logo is rendered as a persistent footer in the bottom-right corner of every composition.
- **Multi-format output.** Every topic is automatically published as four compositions (vertical 9:16, square 1:1, landscape 16:9, portrait 4:5). The layout adapts to the canvas via responsive metrics. One batch command renders all four MP4s.

## Tech stack

| Layer               | Tool                                            |
| ------------------- | ----------------------------------------------- |
| Renderer            | Remotion 4                                      |
| Language            | TypeScript (strict, `noUncheckedIndexedAccess`) |
| Syntax highlighting | `prism-react-renderer`                          |
| Fonts               | `@remotion/google-fonts`                        |
| Codegen runtime     | `tsx`                                           |
| Package manager     | `pnpm`                                          |

## Project structure

```
.
├── content/                          # Source of truth — your videos as data
│   └── <category>/<topic>/v<n>.ts    # One file per version
├── scripts/
│   ├── codegen-topics.ts             # Scans content/ → writes src/_generated/topics.ts
│   └── render-topic.ts               # Batch-renders one topic to all formats
├── src/
│   ├── _generated/
│   │   └── topics.ts                 # AUTO-GENERATED. Gitignored.
│   ├── compositions/
│   │   ├── ShortVideoLayout.tsx      # One <Sequence> per VideoStep
│   │   └── components/
│   │       ├── TitleBanner.tsx       # Topic title in a "{ … };" brand block
│   │       ├── CodeRunner.tsx        # Syntax-highlighted typewriter
│   │       └── BrandFooter.tsx       # Persistent brand logo (bottom-right)
│   ├── types/
│   │   └── content.ts                # TopicMetadata, VideoStep
│   ├── fonts.ts                      # Inter + JetBrains Mono loaders
│   ├── formats.ts                    # Output format catalog (9:16, 1:1, 16:9, 4:5)
│   ├── layout-metrics.ts             # Responsive sizing derived from width/height
│   ├── theme.ts                      # Default brand palette + logo URL
│   ├── Root.tsx                      # Maps (topic × format) → <Composition>s
│   └── index.ts                      # registerRoot()
├── remotion.config.ts
├── package.json
└── tsconfig.json
```

## Prerequisites

- **Node.js** ≥ 18 (tested on 22)
- **pnpm** ≥ 9
- A modern CPU — Remotion bundles via webpack and renders with headless Chromium

## Installation

```bash
pnpm install
```

The first time you run a render Remotion will download a headless Chromium shell (~95 MB). This is automatic.

## Available scripts

| Script                                      | What it does                                                                                                                             |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`                                  | Launches Remotion Studio at `http://localhost:3000`. Pick any composition from the sidebar to preview it. Hot-reloads on file changes.   |
| `pnpm codegen`                              | Regenerates `src/_generated/topics.ts` from `content/*/*/v*.ts`. Runs automatically before `dev`, `build`, `render`, and `render-topic`. |
| `pnpm typecheck`                            | Runs `tsc --noEmit` on the whole project.                                                                                                |
| `pnpm build`                                | Bundles the project for headless rendering.                                                                                              |
| `pnpm render <composition-id> [output.mp4]` | Renders one specific composition (one topic in one format) to MP4.                                                                       |
| `pnpm render-topic <topic-id> [output-dir]` | Batch-renders one topic across **all four formats** to MP4 files in the given directory.                                                 |

## Authoring with AI (skills)

This repo ships **agent skills** so any AI assistant (Claude Code) follows the same
workflow when building a video. They live in `.agents/skills/` and are symlinked into
`.claude/skills/`. `CLAUDE.md` wires them as the mandatory base for video tasks.

| Skill                     | Phase                | What it does                                                                                                                                                                                                                                                         |
| ------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `author-video-topic`      | **Content**          | Researches a topic and writes the script. **Create mode** (new topic): generates `content/<category>/<topic>/v1.ts`. **Deepen mode** (topic exists): writes a `NOTES.md` research doc and an improved next version (`v2.ts`, …). It auto-detects which mode applies. |
| `remotion-best-practices` | **Render / visuals** | Remotion domain knowledge — animations, layout, transitions, audio, captions, formats, rendering.                                                                                                                                                                    |

The intended pipeline is **content first, render second**: `author-video-topic` decides
_what_ the video says and writes the data file; `remotion-best-practices` knows _how_ it
renders. A typical prompt:

```
Research what array.map is in JS and create a video about it
```

`author-video-topic` activates, researches the topic, writes
`content/conceptos/array-map/v1.ts`, runs `pnpm typecheck`, and reports the composition
ids ready to render. It plans a **storytelling arc first** (why it's needed → function →
benefit → real use cases → takeaway) and derives the number of scenes and each scene's
duration from that narrative — no fixed quota. Defaults: Spanish, audience = intermediate
web developers, length driven by the story (~20-45 s). See each `SKILL.md` for the full
contract and conventions.

## Adding a new topic

You can let the `author-video-topic` skill scaffold this for you (see above), or do it by
hand. A "topic" is one short video. To create one:

1. **Pick a category folder** in `content/` (or create a new one — categories are just folders). Existing examples: `conceptos/`, `tips/`.
2. **Create a topic folder** with a kebab-case name: `content/conceptos/my-new-topic/`.
3. **Write `v1.ts`** that exports a `data` object conforming to `TopicMetadata`:

   ```ts
   import type { TopicMetadata } from "../../../src/types/content";

   export const data: TopicMetadata = {
     id: "my-new-topic",
     version: "v1",
     category: "conceptos",
     displayTitle: "My new topic",
     // theme is OPTIONAL — omit it to use the brand defaults
     timeline: [
       {
         id: "step-1",
         durationInSeconds: 5,
         title: "The setup",
         codeSnippet: "const x = 42;",
         language: "javascript",
         narrationText: "We start with a constant.",
       },
       // ...more steps
     ],
   };
   ```

4. **Run `pnpm dev`.** Codegen picks up the new file automatically; the composition appears in the Studio sidebar with the id `<category>--<topic>--<version>` (e.g. `conceptos--my-new-topic--v1`).

### The `TopicMetadata` contract

```ts
type VideoStep = {
  id: string; // Unique within the topic
  durationInSeconds: number; // How long this step stays on screen
  title?: string; // Optional sub-heading
  codeSnippet?: string; // Optional code block (typewriter-animated)
  language?: "typescript" | "javascript" | "bash";
  imageUrl?: string; // Optional image (public/-relative path or http(s) URL)
  imageFocus?: { scale?: number; x?: number; y?: number }; // Zoom/pan into a region
  videoUrl?: string; // Optional screen recording (rendered with OffthreadVideo)
  narrationText: string; // Always shown, fades in after the code
  audioUrl?: string; // Optional voiceover; scene duration follows the audio length
};

type Theme = {
  backgroundColor: string; // Composition background
  primaryColor: string; // Mint accent — step titles, brace decorations
  brandColor: string; // Purple — title block fill, code panel border
  codeBackground: string; // Code panel background
  textColor: string; // Default text (titles, narration)
  mutedTextColor: string; // Reserved for secondary text
};

type TopicMetadata = {
  id: string;
  version: string;
  category: string;
  displayTitle: string;
  theme?: Partial<Theme>; // Optional — any omitted field uses the brand default
  ctaQuestion?: string; // Optional open question shown on the outro
  timeline: VideoStep[];
};
```

## Dynamism: voiceover, motion, music

Short-form platforms reward movement and a human voice. On top of the data-driven base, a topic can opt into:

- **Voiceover** — set `audioUrl` on a step (a file in `public/` or a URL). The scene's duration is then **derived from the audio length** automatically (`calculateMetadata` in `src/Root.tsx`), so narration is never cut off. You stop hand-tuning `durationInSeconds` for voiced scenes.
- **Screen recordings** — set `videoUrl` on a step to play a real clip (`<OffthreadVideo>`) instead of a static screenshot; ideal for showing a click, a filling waterfall, or a dropdown. Duration follows the clip.
- **Zoom / focus on screenshots** — set `imageFocus: { scale, x, y }` to zoom into the region you're explaining so small UI detail reads on mobile. Every image also gets a subtle Ken Burns drift.
- **Background music (automatic, Epidemic Sound)** — every video gets music; the default mood is `lo-fi-hip-hop` (`DEFAULT_BG_MUSIC_MOOD` in `src/music.ts`). Override per topic with `bgMusicMood` (`lo-fi-hip-hop | lofi-house | ambient-tech | synthwave-cyberpunk`); each maps to a real Epidemic Sound genre slug (`MOOD_TAXONOMY`). Run `pnpm fetch-music` to pull licensed tracks from Epidemic Sound into `public/music/` by genre filter (writes the manifest); the render includes them automatically (per-topic > global `src/audio.ts` > none). Requires an active Epidemic Sound subscription. See `docs/rfc/RFC-002-epidemic-sound-music.md`.
- **Engagement CTA** — the outro shows an open question to spark comments. Set `ctaQuestion` per topic; otherwise a generic default is used.

## Versioning topics

When you want to iterate on an existing topic without losing the previous take:

```bash
cp content/conceptos/array-filter/v1.ts content/conceptos/array-filter/v2.ts
```

Bump `version: 'v2'` inside the new file and edit freely. Both `v1` and `v2` show up in the Studio as independent compositions — perfect for A/B comparisons. Git diff on a single file shows exactly what changed between takes.

## Output formats

Every topic is emitted in **four formats** out of the box. The layout adapts to each canvas via responsive metrics in `src/layout-metrics.ts`.

| Format id   | Aspect | Resolution | Composition id suffix | Typical use                                     |
| ----------- | ------ | ---------- | --------------------- | ----------------------------------------------- |
| `vertical`  | 9:16   | 1080×1920  | `…--vertical`         | TikTok, Instagram Reels/Stories, YouTube Shorts |
| `square`    | 1:1    | 1080×1080  | `…--square`           | Instagram feed, LinkedIn, Facebook posts        |
| `landscape` | 16:9   | 1920×1080  | `…--landscape`        | YouTube, Twitter/X, LinkedIn video, web embeds  |
| `portrait`  | 4:5    | 1080×1350  | `…--portrait`         | Instagram feed (taller crop), Pinterest         |

So `conceptos--array-filter--v1` becomes four compositions in the Studio sidebar:

```
conceptos--array-filter--v1--vertical    1080×1920
conceptos--array-filter--v1--square      1080×1080
conceptos--array-filter--v1--landscape   1920×1080
conceptos--array-filter--v1--portrait    1080×1350
```

### Adding or editing formats

The catalog lives in `src/formats.ts`. Append a new entry to add a format, e.g. cinematic 2.39:1:

```ts
{
  id: 'cinema',
  label: 'Cinema',
  width: 2560,
  height: 1080,
  aspectRatio: '2.39:1',
  description: 'Wide cinematic crop',
},
```

After adding it, every topic gets a new `…--cinema` composition automatically.

### Tuning the layout per format

`src/layout-metrics.ts` computes spacing, font sizes, and the footer logo size from `width` and `height`. Adjust the multipliers there if a specific aspect ratio needs more breathing room. The logic uses three buckets — landscape (ratio > 1.3), square (≈ 1.0), and "tall" (vertical / portrait) — so you can tweak one bucket without affecting the others.

## Rendering and exporting

### List available composition ids

```bash
pnpm exec remotion compositions src/index.ts
```

Output (one line per composition):

```
conceptos--array-filter--v1--vertical     30   1080x1920   450 (15.00 sec)
conceptos--array-filter--v1--square       30   1080x1080   450 (15.00 sec)
conceptos--array-filter--v1--landscape    30   1920x1080   450 (15.00 sec)
conceptos--array-filter--v1--portrait     30   1080x1350   450 (15.00 sec)
```

### Render a single format

```bash
pnpm render conceptos--array-filter--v1--vertical out/array-filter-v1-vertical.mp4
```

The `pnpm render` script forwards to `remotion render`, so any flag accepted by the CLI works:

```bash
# Higher CRF (smaller file, lower quality)
pnpm render conceptos--array-filter--v1--vertical out/preview.mp4 --crf=28

# Different codec / format
pnpm render conceptos--array-filter--v1--vertical out/clip.webm --codec=vp9

# Single still frame (PNG)
pnpm render conceptos--array-filter--v1--vertical out/thumb.png --frames=60
```

### Render all four formats of a topic in one go

```bash
pnpm render-topic conceptos--array-filter--v1
```

Writes to `out/conceptos--array-filter--v1/{vertical,square,landscape,portrait}.mp4`.

Override the output directory:

```bash
pnpm render-topic conceptos--array-filter--v1 out/april-batch
# → out/april-batch/vertical.mp4
# → out/april-batch/square.mp4
# → out/april-batch/landscape.mp4
# → out/april-batch/portrait.mp4
```

### Output details

| Setting                    | Value                                        | Where to change                                                                                 |
| -------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Container / codec          | MP4 / H.264 (Remotion default)               | Pass `--codec` to `pnpm render`                                                                 |
| Frame rate                 | 30 fps                                       | `FPS` constant in `src/Root.tsx`                                                                |
| Image format (intra-frame) | JPEG                                         | `Config.setVideoImageFormat` in `remotion.config.ts`                                            |
| Output overwrite           | Allowed                                      | `Config.setOverwriteOutput` in `remotion.config.ts`                                             |
| Audio                      | Per-step voiceover + global background music | `audioUrl` on a `VideoStep` (drives that scene's duration); `backgroundMusic` in `src/audio.ts` |

The first render downloads a headless Chromium shell (~95 MB). Subsequent renders reuse it.

## How it works

```
content/**/v*.ts ──► scripts/codegen-topics.ts ──► src/_generated/topics.ts
                                                          │
                                                          ▼
                                  src/Root.tsx  ×  src/formats.ts
                                                          │
                            (flatmap: one <Composition> per topic × format,
                             durationInFrames computed via calculateMetadata)
                                                          │
                                                          ▼
                                              Remotion Studio / Renderer
                                                          │
                                                          ▼
                                              src/layout-metrics.ts
                                       (responsive sizing per canvas inside
                                        ShortVideoLayout + child components)
```

1. **Codegen** scans `content/*/*/v*.ts` and writes static imports into `src/_generated/topics.ts`. Static imports give the bundler tree-shake visibility and keep the type system happy. The file is gitignored — it's a build artifact.
2. **`Root.tsx`** iterates `allTopics × formats`, emitting one `<Composition>` per pair. The composition id is `<category>--<topic>--<version>--<format>` (Remotion only allows `[a-zA-Z0-9-]`, so the separator is `--`).
3. **`calculateMetadata`** computes `durationInFrames` from `timeline.reduce(...)`. You never set duration manually, and the same data works at any aspect ratio.
4. **`ShortVideoLayout.tsx`** reads `width`/`height` from `useVideoConfig()`, derives a `LayoutMetrics` object, and threads it down to `TitleBanner`, `CodeRunner`, and `BrandFooter`. That single hook keeps the layout consistent across formats.
5. Inside the layout, one `<Sequence>` per `VideoStep` drives the typewriter / fade animations.

## Brand identity

The default look is wired into `src/theme.ts` and is applied to every composition automatically.

### Default palette

| Token             | Value     | Where it shows up                                              |
| ----------------- | --------- | -------------------------------------------------------------- |
| `backgroundColor` | `#150034` | Full composition background                                    |
| `primaryColor`    | `#00F6BB` | Mint accent — `{ … };` braces in the title banner, step titles |
| `brandColor`      | `#4B15C1` | Purple fill of the title block + border of the code panel      |
| `codeBackground`  | `#0c0026` | Code panel background                                          |
| `textColor`       | `#FFFFFF` | Title text, narration                                          |
| `mutedTextColor`  | `#B4B3B6` | Reserved for secondary text                                    |

These mirror the brand palette used on [khriztianmoreno.dev](https://khriztianmoreno.dev) (Russian Violet, Sea Green Crayola, Medium Blue, Gray X).

### Overriding the theme per topic

`theme` is an optional `Partial<Theme>` on `TopicMetadata`. Override only the tokens you want to change — the rest fall back to the defaults:

```ts
export const data: TopicMetadata = {
  // ...
  theme: {
    backgroundColor: "#0f172a", // override just the background
    primaryColor: "#60a5fa", // override just the accent
    // brandColor, codeBackground, textColor stay at defaults
  },
  // ...
};
```

### Brand footer

`BrandFooter` renders the brand logo (Cloudinary-hosted) fixed at the bottom-right of every composition, fading in over the first 24 frames. Swap the logo URL in `src/theme.ts` (`BRAND_LOGO_URL`) if needed.

### Brand outro (automatic)

Every video automatically gets a closing scene inviting viewers to follow `@khriztianmoreno`. It renders with its **own** component (`OutroScene`), distinct from the regular content scenes: **no title banner, no footer**, the brand insignia centered **without a border**, and the message (`SÍGUEME PARA MÁS TIPS 💜`) below it. The title banner and footer are scoped to the content scenes only (`ShortVideoLayout` wraps them in a `<Sequence>` that ends before the outro).

It is **not** stored in the content files — `Root.tsx` adds its duration via `withOutro` and `ShortVideoLayout.tsx` appends the `OutroScene` after the content, so it applies to all topics, existing and new. Edit the handle, central image, heart, copy, or duration in `src/outro.ts` — a single source of truth. Content authors should end their timeline on the topic's takeaway; the outro comes after it for free.

## Customizing visuals

- **Global typography.** Edit `src/fonts.ts` to swap Inter / JetBrains Mono for any other font in `@remotion/google-fonts`.
- **Animation timings.** Constants at the top of `CodeRunner.tsx` (`TITLE_FADE_IN_FRAMES`, `TYPEWRITER_SECS`, `NARRATION_DELAY_SECS`, `NARRATION_FADE_IN_FRAMES`) control the per-step timing.
- **Layout dimensions.** Width, height, and fps live in `src/Root.tsx`. Default is `1080×1920 @ 30fps` for vertical short-form video.

## Roadmap

- Voiceover playback + audio-driven scene durations are wired (`audioUrl`). Still open: auto-**generating** `audioUrl` from `narrationText` via ElevenLabs / OpenAI TTS.
- Per-step transitions (spring-based slide/fade between sequences).
- Pre-rendered Shiki tokens at codegen time for richer themes without runtime cost.
- ~~LLM-assisted scaffolding~~ — done via the `author-video-topic` skill (see [Authoring with AI](#authoring-with-ai-skills)). A `pnpm new-topic "<prompt>"` CLI wrapper is still open.
- Per-topic format opt-in / opt-out (e.g. skip `landscape` for a portrait-only topic).
- Parallel batch rendering across formats inside `render-topic` for faster exports.

## License

See `LICENSE`.
