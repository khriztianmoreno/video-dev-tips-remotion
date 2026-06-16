---
name: author-video-topic
description: Research a technical topic, design the script (scenes, messages, duration, language) and generate the content/<category>/<topic>/vN.ts file ready to render with Remotion in this project. Use for ANY request to create, plan, or research a video/short, OR to deepen/expand an existing topic (deeper research notes + an improved new version).
metadata:
  tags: content, research, scripting, remotion, video, shorts
---

## When to use

Use this skill whenever the user asks to **create, research, plan, or deepen a video**
about a technical topic in this project. Typical triggers:

- "Research what `array.filter` is in JS and create a plan for a video." → **Create mode**
- "I want a short about `useMemo`." → **Create mode**
- "Write me the script for a video about `git rebase`." → **Create mode**
- "Research `array.filter` more and document/expand the current concept." → **Deepen mode**
- "Improve the `array-filter` video / make a v2 with deeper examples." → **Deepen mode**

This skill owns the **content** phase (research → script → write the `.ts`). For
animations, layout, or rendering, hand off to the `remotion-best-practices` skill
(see "Hand-off" below). Together they form the full pipeline: this skill decides
_what_ the video says, `remotion-best-practices` knows _how_ it renders.

## What it produces

- **Create mode:** a `content/<category>/<topic>/v1.ts` file that satisfies the
  `TopicMetadata` contract, passes `pnpm typecheck`, and shows up in Remotion Studio.
- **Deepen mode:** a `content/<category>/<topic>/NOTES.md` research document **plus** an
  improved next version (`v2.ts`, `v3.ts`, …) derived from it.

The skill runs **end-to-end**: it researches, decides, and writes the files without an
intermediate approval gate, then reports the plan + the composition ids to render.

## Modes — pick automatically

Before doing anything, check whether `content/<category>/<topic>/` already exists (search
by topic kebab-case across all categories).

- **No existing folder → Create mode.** Follow the "Create workflow" below.
- **Folder already exists → Deepen mode.** The user wants to research more and improve the
  existing concept. Follow the "Deepen workflow" below. Never overwrite an existing
  version file.

If the user explicitly asks to "start over" or "redo from scratch", honor Create mode even
if the folder exists (but still bump the version, don't clobber).

## Inputs

- **Required:** the topic (e.g. "array.filter in JS").
- **Optional (infer a default if absent):**
  - `category` → folder under `content/`. Default: `conceptos` to explain an API/concept,
    `tips` for a trick/best practice. Don't invent new categories unless asked.
  - `audience` → **default: intermediate web developers.** Calibrate depth to them: don't
    explain syntax they know; spend the time on the _why_, trade-offs, and real use cases.
  - `language` → **default: Spanish** (all existing content is in Spanish). Honor an
    explicit request for English or any other language.
  - `target duration` → not fixed. It emerges from the narrative (typically 20–45 s for a
    storytelling explainer). Only constrain it if the user gives a hard limit.
  - `version` → `v1` unless it already exists; then `v2`, etc. (see "Versioning").

## Create workflow (run end-to-end)

### 1. Research the topic

Use WebSearch when you need to confirm details or current use cases; combine it with your
own knowledge. Gather:

- A precise one-sentence definition.
- 1-2 concrete, real-world use cases (avoid abstract `foo`/`bar` examples).
- The common "gotcha" or misconception (immutability, return value, performance, etc.).
- The minimal signature/syntax needed.

### 2. Plan the narrative FIRST (storytelling, not a feature list)

Decide the **story** before any scene. The default audience is **intermediate web
developers** — skip the absolute basics, respect their time, and earn the "aha". A good
video is a small narrative with tension and resolution, not a mechanical list of facts.

Build an arc that answers, in order:

- **Pre-roll hook** (`TopicMetadata.hook`, a dedicated 1.2–2 s scene before the title) — a punchline / hot take / question that earns the first 2 seconds on a vertical feed. Mandatory for short-form retention. See "Pre-roll hook" below.
- **Why it's needed** — the real friction/pain a dev hits _without_ it.
- **What it is / its function** — the concept and how it actually works.
- **What benefit it brings** — why it beats the alternative (declarative, immutable, safe…).
- **Real use cases** — concrete, recognizable scenarios from everyday work.
- **Takeaway** — the mental model they keep.

Not every topic needs every body beat (the pre-roll hook IS required) — choose the ones
that make THIS concept click and order them as a story (tension → resolution), not as
documentation. A reliable pattern: _pre-roll hook → show the clumsy old way → reveal the
tool → land the benefit → a real use case → the takeaway._ Write the arc out in one or two
lines before moving on.

### 3. Derive scenes and pacing FROM the story (never a quota)

Let the narrative decide the structure. There is **no fixed scene count and no fixed
per-scene duration**. One beat may be a single line of narration (short); another may show
a pain→fix contrast (longer). Map each beat to one `VideoStep`, then size it by what it
must do:

- Time to **read** the `narrationText` (Spanish ≈ 2.5–3 words/sec — count the words).
- Plus time for the `codeSnippet` to type out and breathe (more/longer code = more time).
- Plus a small buffer so nothing feels rushed.

A beat typically lands around **4–7 s**, but use what the content needs, not a bucket.
**Total length follows the story:** storytelling concept explainers usually run **20–45 s**
including the ~1.5 s pre-roll hook (platform ceiling ~60 s). If it can't be told well under
~60 s, propose splitting into a series rather than rushing.

#### Pre-roll hook (required)

A 1.2–2 s scene that plays BEFORE the title banner — a punchline, hot take, shocking stat,
or rhetorical question. This is what earns the first 2 seconds on TikTok/Reels/Shorts;
without it the title-banner intro reads as "another tutorial" and viewers swipe.

Set `TopicMetadata.hook` (NOT a `VideoStep`):

```ts
hook: {
  durationInSeconds: 1.5,
  text: "El 90% lo hace mal",       // ≤ 7 words ideal
  subtext: "filter no muta",         // optional smaller kicker
  variant: "shock",                  // "shock" | "question" | "mistake"
},
```

Pick the variant by tone:

- **`shock`** (default) — mint accent. Hot takes, counterintuitive facts, surprising
  stats. Example: `"Esto rompe en producción"`.
- **`question`** — mint with `?` motif. Rhetorical questions the video then answers.
  Example: `"¿Por qué tu loop es lento?"`.
- **`mistake`** — vermilion `×` prefix. Common errors / "no hagas esto" / anti-patterns.
  Example: `"forEach para esto, NO"`.

Keep the hook independent of the timeline narrative — it's a teaser, not step 0 of the
explanation. The first `VideoStep` must NOT repeat the hook; it picks up the story (the
"friction" beat).

#### Layout selection per beat

Every step has an optional `layout` field; the dispatcher picks the right component.
**Mix at least two layouts per video unless it's a 3-step concept.** Using
`code-typewriter` for every step is what reads as a slideshow.

| `layout`                    | Use it when…                                                                                               | Extra fields                                                                       |
| --------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `code-typewriter` (default) | Building code progressively, demos — the canonical "watch me type this".                                   | `codeSnippet`                                                                      |
| `code-callout`              | Explaining **what a specific token does**. Code stays fully visible; a mint glow animates onto the target. | `codeSnippet` + `calloutToken` (substring to highlight)                            |
| `quote-hero`                | Hot takes, takeaways, statistics, "don't do this", landing one big idea with no code.                      | `quote` (hero phrase, falls back to `narrationText`) + optional `quoteAttribution` |
| `terminal`                  | CLI demos, shell commands, stdout / error output, install / run / test sequences.                          | `terminalLines: { prompt?: string; output: string }[]` (revealed sequentially)     |
| `code-diff`                 | Refactors, "before vs after", clumsy way vs idiomatic way. Two panels with an arrow that draws between.    | `codeBefore` + `codeAfter` (both fall back to `codeSnippet` if missing)            |

Rule of thumb:

- **Pre-roll hook** → handled separately (`TopicMetadata.hook`), not a layout.
- **Friction / problem** → `code-typewriter` with the old/clumsy way, OR `quote-hero` for a quick text-only pain framing.
- **Reveal / mechanic** → `code-typewriter` writing the new tool.
- **What it does** → `code-callout` on the key token (the `filter` call, the `await`, the operator).
- **Refactor / before-after** → `code-diff` (vermilion border on the old panel, mint on the new).
- **CLI / shell** → `terminal` (each command/output line on its own; auto prompt `$` for commands, `#` for `//`-prefixed comments).
- **Takeaway** → `quote-hero` (lands the mental model).

Layouts `data-viz` and `file-tree` are reserved in the type but **not yet implemented** —
don't pick them. If a beat would benefit from one, leave a TODO in `NOTES.md` for a future
version.

#### Atmospheric background (optional)

`TopicMetadata.background` picks an ambient layer rendered behind every content scene
(hook and outro keep their solid background). Default `gradient-drift`. Only override
when the tone clearly calls for it — switching every video is monotonous in its own way.

| `background`               | Tone                                                                                                |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| `gradient-drift` (default) | Calm, premium, neutral. Works for almost everything.                                                |
| `solid`                    | Editorial, clean, presentation-y. Use when code density is high and you want zero distraction.      |
| `noise`                    | Gritty / vintage film-grain. Pairs with hot-takes, retro topics.                                    |
| `grid`                     | Architectural / blueprint feel. Pairs with infra, tooling, structure topics.                        |
| `particles`                | Playful, futuristic. Pairs with energy / cyberpunk moods (and a matching `bgMusicMood`).            |
| `diagonal-lines`           | The khriztianmoreno key visual: flowing diagonal lines + accent streaks + soft arc + sparkles. On-brand hero look. |

#### Transitions

Each step has an optional `transition` field that controls how the PREVIOUS scene hands
off to it (the first step has no incoming transition). Defaults to `fade`. Available:
`fade` · `slide-left` · `wipe` · `flip` · `stinger`.

**Pick 1–2 kinds per video with meaning** — don't randomize:

- `fade` — neutral continuation (most beats).
- `slide-left` — sequential progress, "next step in the chain".
- `flip` — alternative / opposite / a different angle (e.g. wrong → right).
- `wipe` — resets the slate, marks a section boundary (e.g. problem block → solution block).
- `stinger` — the **brand stinger**: a cluster of staggered translucent purple capsules
  (rounded ends) + mint/white/orange accent streaks that wipes in to cover, then dissolves
  to reveal the next scene (`src/transitions/diagonal-stinger.tsx`). Uses the topic's theme
  colors. It's the loudest, most branded transition — use it for **major beat changes**
  (e.g. setup → reveal, or between sections), not on every step. Pairs naturally with the
  `diagonal-lines` background. Longer than the others (`TRANSITION_FRAMES`), so don't chain
  many in a row.

Three transitions of the same kind in a row is fine. Three different kinds in a row
reads as "agent picked at random".

#### Per scene fields

- `title`: short sub-heading (2-4 words) that names the beat, in the chosen language.
- `codeSnippet`: one idea per scene; realistic data (users, prices, orders), never
  `foo`/`bar`. Multi-line is fine when the beat is the code (e.g. the "old way").
- `language`: `javascript` | `typescript` | `bash` (the only values the type allows).
- `imageUrl` (optional): for tool/UI/visual topics (e.g. DevTools, a dashboard), add a
  screenshot. It renders fitted to the scene and **coexists** with `codeSnippet` and
  `narrationText`. Use a path relative to `public/` (download assets there) or an `http(s)`
  URL. If you reuse third-party images, check the license and add attribution (see the
  `devtools-network` topic's `CREDITS.md` for the CC BY pattern). Not every scene needs an
  image — keep the hook/takeaway clean when text lands harder.
- `narrationText`: the spoken/subtitle line for that beat — conversational, moves the story
  forward. The first hooks, the last lands the takeaway.
- `id`: `step-1`, `step-2`, … unique within the topic.

#### Retention & motion (short-form needs movement + a human)

Static text-only scenes read as a slideshow and lose viewers in the first 2-3 s. Prefer
motion and voice where it helps:

- **Voiceover (`audioUrl`)** is the highest-impact lever — a human voice raises retention.
  When a scene has `audioUrl`, its duration is derived from the audio length automatically
  (you don't hand-set `durationInSeconds` for that scene). Suggest the user record/generate
  per-scene MP3s into `public/`.
- **Screen recordings (`videoUrl`)** beat static screenshots for tool/UI topics — show the
  click, the waterfall filling, the throttling dropdown opening. Duration follows the clip.
- **`imageFocus`** zooms/pans into the relevant region of a screenshot so small UI detail is
  legible on mobile (e.g. `{ scale: 1.8, x: 0.42, y: 0.28 }`). Use it whenever a screenshot
  has tiny text/icons. A subtle Ken Burns drift is applied to every image automatically.
- **Background music is automatic.** Every video gets music with the **default mood
  `lo-fi-hip-hop`** (`DEFAULT_BG_MUSIC_MOOD` in `src/music.ts`). Only set `bgMusicMood` on the
  topic to **override** the default when the tone calls for it
  (`'lo-fi-hip-hop' | 'lofi-house' | 'ambient-tech' | 'synthwave-cyberpunk'`) — e.g. `ambient-tech`
  for a calmer concept, `synthwave-cyberpunk` for something energetic. Each mood maps to a real
  Epidemic Sound genre slug (`MOOD_TAXONOMY` in `src/music.ts`). Don't set music per scene. To materialize it, run
  `pnpm fetch-music` (downloads the licensed track from Epidemic Sound into `public/music/`
  and writes the manifest); the render then includes it automatically (per-topic track >
  global `src/audio.ts` > none). Fetching needs an active Epidemic Sound subscription.

### 4. Format decisions

Set and state explicitly: language, category, total duration (= sum of scenes), version,
and `topic` in kebab-case (only `[a-z0-9-]`, must match the folder name and the `id` field).
`displayTitle` may use capitals/parentheses (e.g. `Array.filter()`).

### 5. Write the file

Create `content/<category>/<topic>/v1.ts` with this exact shape (3-level relative import).
This template shows a pre-roll hook, mixed layouts, and one explicit transition — the
canonical pattern, not all-optional decoration:

```ts
import type { TopicMetadata } from "../../../src/types/content";

export const data: TopicMetadata = {
  id: "<topic-kebab>",
  version: "v1",
  category: "<category>",
  displayTitle: "<Visible title>",
  // theme is OPTIONAL — omit it to use the brand defaults
  hook: {
    durationInSeconds: 1.5,
    text: "<≤ 7-word punchline>",
    variant: "shock", // "shock" | "question" | "mistake"
  },
  timeline: [
    {
      id: "step-1",
      durationInSeconds: 4,
      title: "<sub-heading>",
      codeSnippet: "<the clumsy / old way>",
      language: "javascript",
      narrationText: "<friction sentence>",
      // layout defaults to "code-typewriter"; omit unless picking a different one
    },
    {
      id: "step-2",
      durationInSeconds: 5,
      title: "<sub-heading>",
      codeSnippet: "ages.filter(age => age >= 18)",
      language: "javascript",
      narrationText: "<what the new tool does>",
      layout: "code-callout",
      calloutToken: "filter",
      transition: "slide-left",
    },
    {
      id: "step-3",
      durationInSeconds: 4,
      narrationText: "<takeaway as one sentence>",
      layout: "quote-hero",
      quote: "<distilled mental model, ≤ 8 words>",
    },
  ],
};
```

### 6. Validate and report

- Run `pnpm typecheck` and fix any type error before finishing.
- Report to the user: a research summary, the scene plan as a table, total duration, and
  the resulting composition ids
  (`<category>--<topic>--v1--{vertical,square,landscape,portrait}`) with the commands:
  ```bash
  pnpm fetch-music                              # background music (default lo-fi-hip-hop)
  pnpm render-topic <category>--<topic>--v1
  ```

## Deepen workflow (run end-to-end)

For an existing topic the user wants to research further and improve. Produces a research
doc **and** an improved new version.

### 1. Read what exists

Read every `v*.ts` in `content/<category>/<topic>/` and the `NOTES.md` if present.
Identify the current scenes, examples, and language so you build on them, don't repeat them.

### 2. Deepen the research

Go beyond the basics already covered. Use WebSearch and your knowledge to dig into:
edge cases, performance characteristics, common bugs/pitfalls, comparisons with
alternatives (e.g. `filter` vs `for`/`reduce`), browser/runtime support, and idiomatic
patterns. Prefer angles the current version does NOT already cover.

### 3. Write / update `NOTES.md`

Create or update `content/<category>/<topic>/NOTES.md` as the durable research artifact.
Suggested structure (keep it in the topic's language, Spanish by default):

```md
# <Topic> — research notes

## Definición precisa

## Casos de uso reales

## Mecánica / firma

## Edge cases y gotchas

## Comparativas (vs. alternativas)

## Performance

## Ideas de escenas (para futuras versiones)

## Referencias

- <url> — <qué aporta>
```

This file is committed alongside the video and feeds every future version. Append, don't
discard prior notes — mark anything corrected.

### 4. Derive the improved version

Create the next version file (`v2.ts` if `v1` exists, etc.) — **never overwrite an existing
version**. Apply the same **storytelling-first** approach as Create mode (narrative arc →
scenes → pacing derived from the story, calibrated for intermediate web developers), and
raise the quality using the deepened research: a sharper hook, a better gotcha, stronger
use cases, a clearer takeaway. Bump the `version` field to match the filename.

### 5. Validate and report

- Run `pnpm typecheck`.
- Report: what the new research added vs. the old version, a diff-style summary of scene
  changes, the path to `NOTES.md`, and the new composition ids + render command:
  ```bash
  pnpm render-topic <category>--<topic>--v2
  ```
  Both versions stay in Studio side by side for A/B comparison.

## Hand-off to `remotion-best-practices`

This skill stops at the data file. If the task also requires changing **how** the video
looks or renders — new animations, layout/components, transitions, audio/voiceover,
captions, format/resolution, or any actual render — load the `remotion-best-practices`
skill for that work. Don't reimplement Remotion knowledge here.

## Type contract (reference)

```ts
type StepLayout =
  | "code-typewriter" // default
  | "code-callout"
  | "quote-hero"
  | "code-diff"
  | "terminal"
  | "data-viz" // reserved, not yet implemented
  | "file-tree"; // reserved, not yet implemented

type StepTransition = "fade" | "slide-left" | "wipe" | "flip" | "stinger";

type VideoStep = {
  id: string; // unique within the topic
  durationInSeconds: number;
  title?: string; // optional sub-heading
  codeSnippet?: string; // code block (typewriter or full-render depending on layout)
  language?: "typescript" | "javascript" | "bash";
  imageUrl?: string; // optional image: public/-relative path or http(s) URL
  imageFocus?: { scale?: number; x?: number; y?: number }; // zoom/pan into a region
  videoUrl?: string; // optional screen recording (OffthreadVideo)
  narrationText: string; // ALWAYS present — subtitle/voice
  audioUrl?: string; // optional voiceover; sets the scene duration from its length
  layout?: StepLayout; // default "code-typewriter"
  transition?: StepTransition; // incoming transition; default "fade"; first step ignores it
  calloutToken?: string; // for "code-callout": substring to highlight
  quote?: string; // for "quote-hero": hero phrase (falls back to narrationText)
  quoteAttribution?: string; // for "quote-hero": small attribution line
  terminalLines?: { prompt?: string; output: string }[]; // for "terminal"
  codeBefore?: string; // for "code-diff": left/top panel (falls back to codeSnippet)
  codeAfter?: string; // for "code-diff": right/bottom panel
};

type Hook = {
  durationInSeconds: number; // 1.2-2 s recommended
  text: string;
  subtext?: string;
  variant?: "shock" | "question" | "mistake"; // default "shock"
};

type TopicMetadata = {
  id: string;
  version: string; // 'v1', 'v2', …
  category: string; // folder under content/
  displayTitle: string;
  theme?: Partial<Theme>; // optional; omit = brand defaults
  ctaQuestion?: string; // open question shown on the outro (override the default)
  hook?: Hook; // pre-roll, required for short-form retention (recommended on every video)
  bgMusicMood?:
    | "lo-fi-hip-hop"
    | "lofi-house"
    | "ambient-tech"
    | "synthwave-cyberpunk";
  bgMusicFile?: string; // manual override (path or URL); takes precedence over bgMusicMood
  background?: // default "gradient-drift"
  "solid" | "gradient-drift" | "noise" | "grid" | "particles" | "diagonal-lines";
  timeline: VideoStep[];
};
```

Source of truth: `src/types/content.ts` and `src/theme.ts`. If they differ from this
reference, the project files win.

## Versioning

If `content/<category>/<topic>/v1.ts` already exists, **do not overwrite it**: create
`v2.ts` (or the next number) with an updated `version`. Both versions show up as
independent compositions in Studio (great for A/B comparisons).

## Conventions and constraints

- **Do NOT add a follow/CTA/outro scene.** A brand outro is appended automatically to every
  video by the render pipeline (`src/outro.ts` / `OutroScene`): the insignia, an open
  question, and a follow line. Your last scene must be the topic's _takeaway_, never a social
  CTA — the outro comes after it for free. **Do** set a topic-specific `ctaQuestion` (an open
  question that invites comments, e.g. "¿Tu peor cuello de botella?"); without it a generic
  default is used. To change the handle/image/follow copy, edit `src/outro.ts`.
- **Default language: Spanish.** Keep `title` and `narrationText` consistent in one language.
- Topic `id`, folder name, and kebab-case must all match.
- Composition id only allows `[a-zA-Z0-9-]`; the project separator is `--`.
- Don't set `theme` unless the user wants a look different from the brand default.
- Don't touch `src/_generated/` (codegen artifact, gitignored).
- Don't invent fields outside `TopicMetadata`/`VideoStep`.

## Quality checklist (before finishing)

- [ ] Wrote the narrative arc first; scene count and durations come FROM the story (no quota).
- [ ] Arc covers pre-roll hook → why it's needed → function → benefit → real use case → takeaway (the beats that fit this topic), calibrated for intermediate web developers.
- [ ] `hook` is set (≤ 7-word `text`, 1.2–2 s, `variant` matches the tone).
- [ ] First `VideoStep` shows the friction/pain — it does NOT repeat the hook line.
- [ ] Last `VideoStep` lands the takeaway (often `quote-hero`).
- [ ] **At least two layout kinds** across the timeline (unless the video has ≤ 3 steps). Don't use `code-typewriter` for every step.
- [ ] Transitions limited to 1–2 kinds; chosen semantically (`slide-left` for chains, `flip` for opposites, `wipe` for section breaks, `stinger` for a major branded beat change, `fade` everywhere else). Don't overuse `stinger`.
- [ ] `calloutToken` matches a substring that actually appears in the same step's `codeSnippet` (case-sensitive).
- [ ] Each `durationInSeconds` fits the narration length + code typing time (not a bucket).
- [ ] Realistic data in examples, no `foo`/`bar`; one idea per scene.
- [ ] `pnpm typecheck` passes.
- [ ] Reported plan + composition ids + render command.
- [ ] **Deepen mode only:** wrote/updated `NOTES.md`, created a NEW version (didn't overwrite), and the new research actually adds beyond the previous version.
