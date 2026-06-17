---
name: author-video-topic
description: Research a technical topic, write a STORYBOARD.md (or update NOTES.md), and generate the `content/<category>/<topic>/v<N>/<format>.ts` data file ready to render with Remotion. Three modes — Create (new vertical topic), Deepen (research + improved next version), Adapt-format (re-design an existing version for square / landscape / portrait without losing the narrative). Use for ANY request to create, plan, research, deepen, or adapt a video/short.
metadata:
  tags: content, research, scripting, storyboard, remotion, video, shorts, format-adaptation
---

## When to use

Use this skill whenever the user asks to **create, research, plan, deepen, or adapt a video**
about a technical topic in this project. Typical triggers:

- "Research what `array.filter` is in JS and create a plan for a video." → **Create mode**
- "I want a short about `useMemo`." → **Create mode**
- "Write me the script for a video about `git rebase`." → **Create mode**
- "Research `array.filter` more and document/expand the current concept." → **Deepen mode**
- "Improve the `array-filter` video / make a v2 with deeper examples." → **Deepen mode**
- "Adapt `devtools-network` v1 to square." → **Adapt-format mode**
- "Make a landscape version of `array-filter` v2 for YouTube." → **Adapt-format mode**
- "Design `devtools-network` v2 for IG feed." → **Adapt-format mode**

This skill owns the **content** phase (research → STORYBOARD.md → .ts files). For
animations, layout primitives, transitions, audio plumbing, or rendering, hand off to
the `remotion-best-practices` skill. Together they form the full pipeline: this skill
decides _what_ the video says and how its narrative maps to each format; `remotion-best-practices`
knows _how_ the components render.

## What it produces

Every authoring task produces TWO kinds of artifacts in lockstep:

1. **Research artifact** (required, one of):
   - `content/<category>/<topic>/v<N>/STORYBOARD.md` — the per-version script as a
     time-coded markdown table (canonical; required for every version).
   - `content/<category>/<topic>/NOTES.md` — topic-level deep research notes
     (optional but recommended for deep concepts).
2. **Data file(s)** — one `.ts` per output format:
   - `content/<category>/<topic>/v<N>/vertical.ts` — the canonical vertical (9:16).
   - `content/<category>/<topic>/v<N>/square.ts` — square (1:1) adaptation, when authored.
   - `content/<category>/<topic>/v<N>/landscape.ts` — landscape (16:9), when authored.
   - `content/<category>/<topic>/v<N>/portrait.ts` — portrait (4:5), when authored.

**Hard rule.** You may NOT write a `<format>.ts` file unless a `STORYBOARD.md` (or
sufficient `NOTES.md`) for that version already exists or is created in the same run.
The .ts is a translation of the storyboard into Remotion data; without the storyboard
there is no source of truth for the script.

The skill runs **end-to-end**: it researches, writes the storyboard, derives the .ts,
runs `pnpm typecheck`, and reports the result.

## Modes — pick automatically

Before doing anything, check the file system:

```
content/<category>/<topic>/
├── NOTES.md                  (optional, topic-level research)
├── v<N>/
│   ├── STORYBOARD.md         (per-version, REQUIRED)
│   ├── vertical.ts           (the canonical format)
│   └── <format>.ts           (zero or more format adaptations)
```

Decide which mode based on what exists and what the user asks:

- **No `content/<category>/<topic>/` folder at all → Create mode.**
  Topic does not exist. Build it from scratch (research → STORYBOARD.md → vertical.ts).
- **Folder exists, user wants more depth / a better version → Deepen mode.**
  Triggers: "improve", "deepen", "next version", "research more". Write/update NOTES.md,
  then create the next `v<N+1>/` folder with a fresh STORYBOARD.md + vertical.ts.
- **Folder + a version exist, user wants the SAME content in a different format → Adapt-format mode.**
  Triggers: "adapt to <format>", "design for <platform>", "make a square version".
  Source version stays untouched. Re-design the script for the target aspect ratio
  inside the SAME version folder.

If the user explicitly asks to "start over" or "redo from scratch", honor Create mode
even if the folder exists (but still bump the version, don't clobber).

## Inputs

- **Required:** the topic (e.g. "array.filter in JS").
- **Required for Adapt-format mode:** the source version (e.g. "v1") and the target format (`square` | `landscape` | `portrait` | `vertical`).
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
  - `format` (Create mode default) → `vertical`. Create mode never auto-emits other
    formats — those go through Adapt mode.

## STORYBOARD.md format (canonical script)

Each `v<N>/STORYBOARD.md` is a markdown file with a brief narrative-arc paragraph and a
single 4-column table. This IS the source of truth for the video — every format `.ts`
derives from it.

```md
# <Topic> — Storyboard (v<N>)

Narrative: <one-line arc, e.g. "friction → reveal → benefit → use case → takeaway">.
Format-specific `.ts` files in this folder derive from this table.

| Tiempo        | Plan Visual (Remotion Setup)                         | Código / Asset a Renderizar                       | Audio (Locución)                          |
| ------------- | ---------------------------------------------------- | ------------------------------------------------- | ----------------------------------------- |
| 00:00 - 00:01.5 | `hook` · `variant: shock` — punchline springs in   | Hero: `"<≤ 7-word punchline>"` · Subtext: `"…"`  | "<same as hero, spoken>"                  |
| 00:01.5 - 00:08 | `step-1` · `code-typewriter` "<sub-heading>"       | `<code or // comment>`                            | "<one sentence>"                          |
| 00:08 - 00:14 | `step-2` · `code-callout` · `calloutToken: "filter"` | `<code with the highlighted token>`              | "<one sentence>"                          |
| 00:14 - 00:19 | `step-3` · `quote-hero` (takeaway)                  | `quote: "<distilled mental model>"`               | "<one sentence>"                          |
| 00:19 - 00:25 | Outro (handled by render pipeline)                  | Brand insignia + `ctaQuestion` + follow           | — (silence; ambient bg music continues)   |
```

Column rules:

- **Tiempo** — `MM:SS - MM:SS` ranges starting at `00:00` (the hook, if present). Use the
  declared `durationInSeconds`; don't subtract transition overlap for storyboard timing.
- **Plan Visual** — references the `id`, the `layout`, and any non-trivial fields
  (`transition`, `imageFocus`, `calloutToken`, `quote`, hook `variant`).
- **Código / Asset a Renderizar** — what shows on screen: code snippet (one-liner OR
  multi-line), image path, or a description.
- **Audio (Locución)** — the spoken/subtitle line. Same string that ends up in
  `narrationText` (or `hook.text` for the hook row).

Add a final **Outro** row even though it's not a `VideoStep` — it makes the timing match
the rendered video.

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

| `background`               | Tone                                                                                                              |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `gradient-drift` (default) | Calm, premium, neutral. Works for almost everything.                                                              |
| `solid`                    | Editorial, clean, presentation-y. Use when code density is high and you want zero distraction.                    |
| `noise`                    | Gritty / vintage film-grain. Pairs with hot-takes, retro topics.                                                  |
| `grid`                     | Architectural / blueprint feel. Pairs with infra, tooling, structure topics.                                      |
| `particles`                | Playful, futuristic. Pairs with energy / cyberpunk moods (and a matching `bgMusicMood`).                          |
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

### 4. Write `STORYBOARD.md` FIRST

Create `content/<category>/<topic>/v1/STORYBOARD.md` with the 4-column table described in
the "STORYBOARD.md format" section above. This is the canonical script. **You may not skip
this step or write it after the .ts** — the storyboard is the source of truth.

If the topic warrants a deeper research artifact (edge cases, perf, comparatives), also
write `content/<category>/<topic>/NOTES.md` at the topic level. For most concept explainers
the storyboard alone is enough.

### 5. Write the vertical data file

Create `content/<category>/<topic>/v1/vertical.ts` (note: **4 levels** of relative import).
This template shows a pre-roll hook, mixed layouts, and one explicit transition — the
canonical pattern, not all-optional decoration:

```ts
import type { TopicMetadata } from "../../../../src/types/content";

export const data: TopicMetadata = {
  id: "<topic-kebab>",
  version: "v1",
  category: "<category>",
  format: "vertical",
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

**Create mode emits ONLY `vertical.ts`.** Don't generate `square.ts`, `landscape.ts`, or
`portrait.ts` from Create mode — those go through Adapt-format mode, which actively
re-designs the script for each canvas.

### 6. Validate and report

- Run `pnpm typecheck` and fix any type error before finishing.
- Report to the user: a research summary, the storyboard table, total duration, and the
  resulting composition id with the commands:
  ```bash
  pnpm fetch-music                                    # background music (default lo-fi-hip-hop)
  pnpm render-topic <category>--<topic>--v1           # renders every <format>.ts present in v1/
  ```

## Deepen workflow (run end-to-end)

For an existing topic the user wants to research further and improve. Produces a research
doc **and** an improved new version (with its own STORYBOARD + vertical.ts).

### 1. Read what exists

Read every `v<N>/vertical.ts`, every `v<N>/STORYBOARD.md`, and `NOTES.md` if present.
Identify the current scenes, examples, and language so you build on them, don't repeat them.

### 2. Deepen the research

Go beyond the basics already covered. Use WebSearch and your knowledge to dig into:
edge cases, performance characteristics, common bugs/pitfalls, comparisons with
alternatives (e.g. `filter` vs `for`/`reduce`), browser/runtime support, and idiomatic
patterns. Prefer angles the current version does NOT already cover.

### 3. Write / update `NOTES.md`

Create or update `content/<category>/<topic>/NOTES.md` as the durable topic-level research
artifact. Suggested structure (keep it in the topic's language, Spanish by default):

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

### 4. Write the new version's STORYBOARD.md + vertical.ts

Create the next version folder (`v2/` if `v1/` exists, etc.) — **never overwrite an existing
version folder**. Inside it:

1. Write `v2/STORYBOARD.md` from scratch using the deepened research.
2. Write `v2/vertical.ts` derived from the storyboard.

Apply the same **storytelling-first** approach as Create mode (narrative arc → scenes →
pacing derived from the story, calibrated for intermediate web developers), and raise the
quality using the deepened research: a sharper hook, a better gotcha, stronger use cases,
a clearer takeaway. Bump the `version` field to match the folder.

### 5. Validate and report

- Run `pnpm typecheck`.
- Report: what the new research added vs. the old version, a diff-style summary of scene
  changes, the path to `NOTES.md`, and the new composition id + render command:
  ```bash
  pnpm render-topic <category>--<topic>--v2
  ```
  Both versions stay in Studio side by side for A/B comparison.

## Adapt-format workflow (run end-to-end)

For an existing version the user wants to publish in another canvas (square, landscape,
portrait). The narrative stays — the layout, code length, pacing, and even the hook
phrasing may NOT.

### 1. Locate the source

Identify the topic, source version, and target format from the request. Verify that
`content/<category>/<topic>/v<N>/vertical.ts` and `STORYBOARD.md` both exist. If the
target file already exists (e.g. `v<N>/square.ts`), refuse to overwrite — ask the user
whether to bump the version instead.

### 2. Read the storyboard + source vertical .ts

Read `STORYBOARD.md` first — it's the canonical script. Then read the vertical `.ts` to
see the concrete `VideoStep` shape, durations, and layout choices currently chosen.

### 3. Re-design the script for the target format

Do NOT copy the vertical timeline 1:1 and change the dimensions — the layout is the same
but the FRAMING of every scene must be reconsidered. For each step, ask:

- **Hook (`text`/`subtext`).** Fewer characters fit on landscape (single line, wider).
  Square reads punchier with shorter words. Verify the hook still lands at the new aspect.
- **`layout` per step.** Some layouts read very differently per format:
  - `code-diff` (vermilion vs mint side-by-side) shines on **landscape** (16:9) — two
    panels side-by-side with breathing room. On vertical/portrait the panels stack and
    feel narrower. Re-evaluate whether `code-diff` still wins on the target.
  - `quote-hero` works everywhere but the optimal font scale differs — let the metrics
    handle it.
  - `code-callout` works everywhere; the highlight rect lands on the token regardless.
  - `code-typewriter` with a multi-line snippet may overflow on **square**. Shorten the
    snippet or split into two steps.
  - `terminal` benefits from horizontal space — on landscape you can show longer commands
    without wrap. On vertical, shorter commands.
- **`codeSnippet` length.** Square has less vertical real-estate for code panels; trim
  multi-line snippets. Landscape has more horizontal room; you can keep / extend.
- **`imageFocus`.** Same screenshot, different crop. A region that's centered in
  vertical may need to shift on landscape. Re-pick `x`/`y` for the target.
- **Durations.** Slightly faster reading on landscape (eyes scan wider faster), slightly
  slower on portrait. Re-pace if needed.
- **`background`.** Some variants shift in feel by aspect (`particles` looks denser on
  square, sparser on landscape). Re-evaluate.

### 4. Update STORYBOARD.md (optional but encouraged)

If the format adaptation changes timing/layout choices materially, add a note row at the
bottom of `STORYBOARD.md` summarizing the per-format deltas, or split the storyboard into
sections per format. Don't delete the canonical (vertical) rows — append.

### 5. Write `<format>.ts`

Create `content/<category>/<topic>/v<N>/<format>.ts` next to the source `vertical.ts`.
The file structure is identical to `vertical.ts` except `format: "<target-format>"`.
Use the SAME `id`, `version`, `category`, `displayTitle` — those identify the topic,
not the format.

### 6. Validate and report

- Run `pnpm typecheck`.
- Report: a per-step diff vs the source format (what changed and why), the new composition
  id (`<category>--<topic>--v<N>--<format>`), and the render command:
  ```bash
  pnpm render-topic <category>--<topic>--v<N>     # now renders all formats in v<N>/
  ```

## Hand-off to `remotion-best-practices`

This skill stops at the data file + storyboard. If the task also requires changing **how**
the video looks or renders — new animations, layout components, transitions, audio/voiceover,
captions, the per-format rendering pipeline, or any actual render — load the
`remotion-best-practices` skill for that work. Don't reimplement Remotion knowledge here.

## Type contract (reference)

```ts
type FormatId = "vertical" | "square" | "landscape" | "portrait";

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
  version: string; // 'v1', 'v2', …  (matches the v<N>/ folder name)
  category: string; // folder under content/
  format: FormatId; // REQUIRED — target canvas for this file
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

Source of truth: `src/types/content.ts`, `src/formats.ts`, and `src/theme.ts`. If they
differ from this reference, the project files win.

## File layout (canonical)

```
content/<category>/<topic>/
├── NOTES.md                  (optional, topic-level deep research)
├── CREDITS.md                (optional, image/3rd-party attribution)
└── v<N>/                     (one folder per version — never overwrite)
    ├── STORYBOARD.md         (REQUIRED, per-version script)
    ├── vertical.ts           (the canonical format, written first)
    ├── square.ts             (Adapt mode output — only when authored)
    ├── landscape.ts          (Adapt mode output — only when authored)
    └── portrait.ts           (Adapt mode output — only when authored)
```

## Versioning

- A "version" is a directory `v<N>/` containing a `STORYBOARD.md` and one or more
  `<format>.ts` files. The directory name is the version identifier (`v1`, `v2`, …).
- The `version` field inside each `<format>.ts` MUST match the parent folder name.
- **Never overwrite an existing version folder.** Deepen mode creates `v<N+1>/`. Adapt mode
  writes a new `<format>.ts` INSIDE the existing version folder.
- Within a version folder, every `<format>.ts` shares the same `version`, `id`,
  `category`, and `displayTitle`, but `format` differs. Everything else (layout,
  durations, code length) may be tailored per format.

## Conventions and constraints

- **Do NOT add a follow/CTA/outro scene.** A brand outro is appended automatically to every
  video by the render pipeline (`src/outro.ts` / `OutroScene`): the insignia, an open
  question, and a follow line. Your last scene must be the topic's _takeaway_, never a social
  CTA — the outro comes after it for free. **Do** set a topic-specific `ctaQuestion` (an open
  question that invites comments, e.g. "¿Tu peor cuello de botella?"); without it a generic
  default is used. To change the handle/image/follow copy, edit `src/outro.ts`.
- **One format per file.** Don't try to encode multiple aspect ratios in one `.ts`.
- **Create mode emits ONLY `vertical.ts`.** Other formats go through Adapt mode.
- **Default language: Spanish.** Keep `title` and `narrationText` consistent in one language.
- Topic `id`, folder name, and kebab-case must all match.
- Composition id only allows `[a-zA-Z0-9-]`; the project separator is `--`.
- Don't set `theme` unless the user wants a look different from the brand default.
- Don't touch `src/_generated/` (codegen artifact, gitignored).
- Don't invent fields outside `TopicMetadata`/`VideoStep`.

## Quality checklist (before finishing)

### All modes

- [ ] Wrote the narrative arc first; scene count and durations come FROM the story (no quota).
- [ ] **Research artifact exists:** wrote/updated `STORYBOARD.md` BEFORE the `.ts`. NOTES.md exists when the topic warrants deep research.
- [ ] `pnpm typecheck` passes.
- [ ] Reported plan + composition id(s) + render command.

### Create mode

- [ ] Arc covers pre-roll hook → why it's needed → function → benefit → real use case → takeaway (the beats that fit this topic), calibrated for intermediate web developers.
- [ ] `hook` is set (≤ 7-word `text`, 1.2–2 s, `variant` matches the tone).
- [ ] First `VideoStep` shows the friction/pain — it does NOT repeat the hook line.
- [ ] Last `VideoStep` lands the takeaway (often `quote-hero`).
- [ ] **At least two layout kinds** across the timeline (unless the video has ≤ 3 steps). Don't use `code-typewriter` for every step.
- [ ] Transitions limited to 1–2 kinds; chosen semantically (`slide-left` for chains, `flip` for opposites, `wipe` for section breaks, `stinger` for a major branded beat change, `fade` everywhere else). Don't overuse `stinger`.
- [ ] `calloutToken` matches a substring that actually appears in the same step's `codeSnippet` (case-sensitive).
- [ ] Each `durationInSeconds` fits the narration length + code typing time (not a bucket).
- [ ] Realistic data in examples, no `foo`/`bar`; one idea per scene.
- [ ] **Wrote only `vertical.ts`.** Did not auto-emit other formats.

### Deepen mode

- [ ] Wrote/updated `NOTES.md` with new research that's distinct from prior versions.
- [ ] Created a NEW `v<N+1>/` folder (didn't overwrite).
- [ ] Wrote `v<N+1>/STORYBOARD.md` from scratch and `v<N+1>/vertical.ts` derived from it.
- [ ] The new version actually adds beyond the previous (sharper hook, better example, new gotcha).

### Adapt-format mode

- [ ] Verified the source `<sourceFormat>.ts` and `STORYBOARD.md` exist.
- [ ] Did NOT overwrite an existing target-format `.ts`.
- [ ] For EVERY step, explicitly reconsidered: hook text length, layout choice, code length, `imageFocus`, durations, and background.
- [ ] Wrote a concise per-step diff vs the source format in the report.
- [ ] All shared fields (`id`, `version`, `category`, `displayTitle`) match the source file exactly.
