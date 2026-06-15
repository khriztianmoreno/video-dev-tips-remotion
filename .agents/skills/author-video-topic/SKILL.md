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
*what* the video says, `remotion-best-practices` knows *how* it renders.

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
    explain syntax they know; spend the time on the *why*, trade-offs, and real use cases.
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
- **Why it's needed** — the real friction/pain a dev hits *without* it (the hook).
- **What it is / its function** — the concept and how it actually works.
- **What benefit it brings** — why it beats the alternative (declarative, immutable, safe…).
- **Real use cases** — concrete, recognizable scenarios from everyday work.
- **Takeaway** — the mental model they keep.

Not every topic needs every beat — choose the ones that make THIS concept click and order
them as a story (tension → resolution), not as documentation. A reliable pattern:
*hook with the pain → show the clumsy old way → reveal the tool → land the benefit → a real
use case → the takeaway.* Write the arc out in one or two lines before moving on.

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
(platform ceiling ~60 s). If it can't be told well under ~60 s, propose splitting into a
series rather than rushing.

Per scene:
- `title`: short sub-heading (2-4 words) that names the beat, in the chosen language.
- `codeSnippet`: one idea per scene; realistic data (users, prices, orders), never
  `foo`/`bar`. Multi-line is fine when the beat is the code (e.g. the "old way").
- `language`: `javascript` | `typescript` | `bash` (the only values the type allows).
- `narrationText`: the spoken/subtitle line for that beat — conversational, moves the story
  forward. The first hooks, the last lands the takeaway.
- `id`: `step-1`, `step-2`, … unique within the topic.

### 4. Format decisions
Set and state explicitly: language, category, total duration (= sum of scenes), version,
and `topic` in kebab-case (only `[a-z0-9-]`, must match the folder name and the `id` field).
`displayTitle` may use capitals/parentheses (e.g. `Array.filter()`).

### 5. Write the file
Create `content/<category>/<topic>/v1.ts` with this exact shape (3-level relative import):

```ts
import type { TopicMetadata } from '../../../src/types/content';

export const data: TopicMetadata = {
  id: '<topic-kebab>',
  version: 'v1',
  category: '<category>',
  displayTitle: '<Visible title>',
  // theme is OPTIONAL — omit it to use the brand defaults
  timeline: [
    {
      id: 'step-1',
      durationInSeconds: 4,
      title: '<sub-heading>',
      codeSnippet: '<code>',
      language: 'javascript',
      narrationText: '<one sentence>',
    },
    // …
  ],
};
```

### 6. Validate and report
- Run `pnpm typecheck` and fix any type error before finishing.
- Report to the user: a research summary, the scene plan as a table, total duration, and
  the resulting composition ids
  (`<category>--<topic>--v1--{vertical,square,landscape,portrait}`) with the render command:
  ```bash
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
type VideoStep = {
  id: string;                 // unique within the topic
  durationInSeconds: number;  // 4-6 s recommended
  title?: string;             // optional sub-heading
  codeSnippet?: string;       // code block (typewriter)
  language?: 'typescript' | 'javascript' | 'bash';
  narrationText: string;      // ALWAYS present — subtitle/voice
  audioUrl?: string;          // reserved for TTS, do not use yet
};

type TopicMetadata = {
  id: string;
  version: string;            // 'v1', 'v2', …
  category: string;           // folder under content/
  displayTitle: string;
  theme?: Partial<Theme>;     // optional; omit = brand defaults
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

- **Default language: Spanish.** Keep `title` and `narrationText` consistent in one language.
- Topic `id`, folder name, and kebab-case must all match.
- Composition id only allows `[a-zA-Z0-9-]`; the project separator is `--`.
- Don't set `theme` unless the user wants a look different from the brand default.
- Don't touch `src/_generated/` (codegen artifact, gitignored).
- Don't invent fields outside `TopicMetadata`/`VideoStep`.

## Quality checklist (before finishing)

- [ ] Wrote the narrative arc first; scene count and durations come FROM the story (no quota).
- [ ] Arc covers why it's needed → function → benefit → real use case → takeaway (the beats
      that fit this topic), calibrated for intermediate web developers.
- [ ] First scene hooks with a real pain; last scene lands the takeaway.
- [ ] Each `durationInSeconds` fits the narration length + code typing time (not a bucket).
- [ ] Realistic data in examples, no `foo`/`bar`; one idea per scene.
- [ ] `pnpm typecheck` passes.
- [ ] Reported plan + composition ids + render command.
- [ ] **Deepen mode only:** wrote/updated `NOTES.md`, created a NEW version (didn't
      overwrite), and the new research actually adds beyond the previous version.
