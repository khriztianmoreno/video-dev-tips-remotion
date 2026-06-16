# CLAUDE.md

Guidance for AI agents working in this repository.

## What this project is

A data-driven generator for short-form technical videos (Shorts/Reels/TikTok) built with
Remotion. **Content is the source of truth**: each video is a plain TypeScript object in
`content/<category>/<topic>/vN.ts` conforming to `TopicMetadata` (`src/types/content.ts`).
The visual layer is a stateless renderer. See `README.md` for the full architecture.

## Skills are the base for any video work — use them, don't improvise

This repo ships two skills that MUST be the starting point for video tasks. Pick by phase;
most real tasks use both, in order.

| Phase | Skill | Use it when the task is about… |
|---|---|---|
| **1. Content** | `author-video-topic` | Researching a topic, writing the script, deciding scenes/messages/duration/language, generating the `content/**/vN.ts` data file. Also **deepening** an existing topic: deeper research → `NOTES.md` + an improved new version. It auto-detects create vs. deepen by whether the topic folder exists. |
| **2. Render/visuals** | `remotion-best-practices` | Remotion code: animations, layout, components, transitions, audio/voiceover, captions, formats, or running an actual render. |

### Required workflow

When a request involves **creating or planning a video** (e.g. "make a short about
`array.map`", "research X and turn it into a video"):

1. **Always invoke `author-video-topic` first.** It owns research → script → the `.ts` file.
   Do not hand-write a `content/**/vN.ts` from scratch without it.
2. **Then invoke `remotion-best-practices`** for anything touching `src/` (compositions,
   components, animation, theme, formats) or any render/preview.
3. Never reimplement Remotion knowledge inline — defer to `remotion-best-practices`.
4. Never invent fields outside the `TopicMetadata`/`VideoStep` contract.

If a task is purely visual/engineering (e.g. "add a new output format", "fix the footer
animation") and creates no new topic, you may go straight to `remotion-best-practices`.

### Custom visual modules (project-specific, not in `remotion-best-practices`)

`remotion-best-practices` is an external, hash-locked skill (`skills-lock.json`) — **do not
edit it**. The brand-specific visual building blocks live in the repo; this is where to look
or extend when a task touches them:

- **Transitions** → `src/motion.ts` (`resolveTransition`, `TRANSITION_FRAMES`) + custom
  presentations in `src/transitions/` (e.g. `diagonal-stinger.tsx` — the brand stinger).
  Add a `StepTransition` value in `src/types/content.ts` and a case in `resolveTransition`.
- **Backgrounds** → `src/backgrounds.ts` + `src/compositions/components/backgrounds/`
  (e.g. `DiagonalLinesBackground.tsx` — the key visual). Register in `Background.tsx`.
- **Per-step layouts** → `src/compositions/layouts/`, dispatched by `CodeRunner.tsx`.
- **Outro / hook / music** → `src/outro.ts`, `HookScene.tsx`, `src/music.ts` + `src/audio.ts`.

When adding a new transition/background/layout: extend the union in `src/types/content.ts`,
implement the component, register it in the dispatcher, then document the new value in
`author-video-topic`'s SKILL.md so authors know it exists.

## Project conventions (quick reference)

- **Audience: intermediate web developers.** Don't explain basic syntax; spend time on the
  *why*, trade-offs, and real use cases.
- **Storytelling over mechanics.** Every video is a narrative (why it's needed → function →
  benefit → use cases → takeaway). Scene count and per-scene duration are derived from the
  story, never from a fixed quota.
- **Default content language: Spanish.** All existing topics are in Spanish; honor an
  explicit request for another language.
- Topic `id`, folder name, and kebab-case all match; composition ids use `--` as separator.
- `src/_generated/` is a gitignored codegen artifact — never edit it by hand.
- Validate any content/code change with `pnpm typecheck`.
- Render a topic across all formats with `pnpm render-topic <category>--<topic>--<version>`.

## Skill locations

Both skills live in `.agents/skills/` and are symlinked into `.claude/skills/`:
- `.agents/skills/author-video-topic/SKILL.md`
- `.agents/skills/remotion-best-practices/SKILL.md` (+ `rules/` for deep-dive topics)
