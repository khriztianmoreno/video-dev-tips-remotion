# Motion Design Roadmap

A phased, evolutionary plan to move the project from "good data-driven scaffolding" to "doesn't feel like a PowerPoint". Each phase is independently shippable. Pick one when you have a free session, mark its checkboxes as you go, and don't skip ahead unless a later phase is genuinely blocking the one in front.

The phases are ordered by **perceptual ROI** — the early phases are what viewers will notice most. Phase 1 alone changes more about the "feel" than Phases 4-6 combined.

---

## Status overview

| #   | Phase                                            | Impact | Effort | Status      |
| --- | ------------------------------------------------ | ------ | ------ | ----------- |
| 1   | Motion fundamentals (spring + scene transitions) | High   | M      | Not started |
| 2   | Layout variety (multi-layout dispatch)           | High   | L      | Not started |
| 3   | Hook scene + sound design                        | High   | M      | Not started |
| 4   | Code-level dynamism (token highlight, morphing)  | Medium | L      | Not started |
| 5   | Decorative / atmospheric layer                   | Medium | M      | Not started |
| 6   | TTS narration pipeline                           | Medium | M      | Not started |
| 7   | Long-tail polish                                 | Low    | S      | Not started |

**Effort key:** S = 1-2h · M = 3-6h · L = 1+ day

**Current state (baseline):** brand theme, brand footer, four output formats, responsive layout metrics, outro scene, per-step images, AI-skill scaffolding (`author-video-topic`, `remotion-best-practices`), `@remotion/media-utils` installed.

---

## Guiding principles

1. **Nothing pops in or out without motion.** Every appearance is a transition; every disappearance is one too. Linear opacity changes are a code smell — at minimum use spring or an out-expo bezier.
2. **Asymmetry over centering.** Centered, axis-aligned layouts are why "presentation" is the default mental category. Break the vertical axis at least once per video.
3. **Always-on micro-motion.** Anything visible for more than 2 seconds should have idle motion (sine bobble, slow drift, opacity pulse). Static = slide.
4. **Variety per scene type.** If two consecutive scenes share the same template, one of them should switch layout.
5. **Sound is half the perception.** A video without sound design feels like a deck regardless of motion quality. Phase 3 is not optional.

---

## Phase 1 — Motion fundamentals

**Why this matters.** The biggest single delta between "tutorial slide deck" and "social-media video" is motion physics. Lines moving at constant velocity feel computer-generated; springs feel hand-animated. Adding scene transitions removes the cut between `Sequence`s that currently reads as "next slide".

### Tasks

- [ ] Audit every `interpolate(frame, [a, b], [0, 1])` for entrance animations. Replace with `spring({ frame, fps, config })`.
- [ ] Keep `interpolate` only for: typewriter progress, narration timing offsets, and continuous drives. For those, add `easing: Easing.bezier(0.22, 1, 0.36, 1)` (out-expo).
- [ ] Centralize spring configs in `src/motion.ts`:
  ```ts
  export const enter = { damping: 14, mass: 0.6, stiffness: 100 };
  export const enterSubtle = { damping: 20, mass: 0.8, stiffness: 120 };
  export const punch = { damping: 8, mass: 0.4, stiffness: 200 };
  ```
- [ ] `pnpm add @remotion/transitions`.
- [ ] Wrap the `timeline.map(<Sequence>...)` in `ShortVideoLayout` with `<TransitionSeries>`. Default transition `fade` of 8 frames. Allow per-step override via a new optional `VideoStep.transition?: 'fade' | 'slide-left' | 'wipe' | 'flip'`.
- [ ] Add a `transition` field to the `VideoStep` type; default to `'fade'`. Pick 2-3 transition kinds at most across one video — using a different one every step is just as monotonous as none.

### Files

- `src/motion.ts` (new)
- `src/compositions/components/TitleBanner.tsx`
- `src/compositions/components/CodeRunner.tsx`
- `src/compositions/components/BrandFooter.tsx`
- `src/compositions/ShortVideoLayout.tsx`
- `src/types/content.ts`

### References

- [Remotion `spring()`](https://www.remotion.dev/docs/spring) — physics parameters reference
- [Spring playground](https://springs.pomb.us/) — interactive spring config tuner
- [Remotion `Easing`](https://www.remotion.dev/docs/easing) — bezier curves table
- [`@remotion/transitions`](https://www.remotion.dev/docs/transitions/) — package overview
- [TransitionSeries](https://www.remotion.dev/docs/transitions/transitionseries) — series API
- Built-in presentations: [fade](https://www.remotion.dev/docs/transitions/presentations/fade), [slide](https://www.remotion.dev/docs/transitions/presentations/slide), [wipe](https://www.remotion.dev/docs/transitions/presentations/wipe), [flip](https://www.remotion.dev/docs/transitions/presentations/flip), [clockWipe](https://www.remotion.dev/docs/transitions/presentations/clock-wipe)

### Done when

- Zero linear `interpolate(..., [0, 1])` entry animations remain in the codebase.
- Switching between `Sequence`s is a transition, not a hard cut.
- A side-by-side render of the same topic (pre/post Phase 1) shows the change is obvious in the first 3 seconds.

---

## Phase 2 — Layout variety

**Why this matters.** Today, `CodeRunner` is the _only_ per-step layout. Every step has identical anatomy: step title at top, code panel in middle, narration at bottom. Even with perfect motion, repetition reads as "template". Multiple layouts intercut give the brain a reason to keep watching.

### New layouts to implement (priority order)

1. **`code-callout`** — full snippet visible, a highlight box animates over a specific token while the narration mentions it. Best for explaining _what_ a function call does.
2. **`code-diff`** — before/after side by side (vertical stack on portrait, horizontal on landscape). Arrow or `→` animates between them. Best for refactors / improvements.
3. **`quote-hero`** — solo huge quote, no code. For hot takes, mistakes, "don't do this", takeaway lines.
4. **`terminal`** — black background, prompt cursor, stdout typewriter. For CLI demos, error output, command sequences.
5. **`data-viz`** — array/object visualized as boxes that transform. Perfect for `.filter`/`.map`/`.reduce` explanations (the box for `14` fades out, the box for `22` stays).
6. **`file-tree`** — directory listing with highlight. For project structure discussions.

### Tasks

- [ ] Add `layout?: LayoutId` to `VideoStep`. Default `'code-typewriter'` (= current behavior). Type:
  ```ts
  type LayoutId =
    | "code-typewriter"
    | "code-callout"
    | "code-diff"
    | "quote-hero"
    | "terminal"
    | "data-viz"
    | "file-tree";
  ```
- [ ] Add layout-specific fields to `VideoStep` (optional, only used by certain layouts):
  - `calloutToken?: string` (for `code-callout`)
  - `codeBefore?: string`, `codeAfter?: string` (for `code-diff`)
  - `quote?: string`, `quoteAttribution?: string` (for `quote-hero`)
  - `terminalLines?: { prompt?: string; output: string }[]` (for `terminal`)
  - `dataItems?: { value: string; kept: boolean }[]` (for `data-viz`)
  - `tree?: { path: string; highlight?: boolean }[]` (for `file-tree`)
- [ ] Refactor `CodeRunner` into a dispatcher: it reads `step.layout` and renders one of the layout components.
- [ ] Move the current implementation into `src/compositions/layouts/CodeTypewriterLayout.tsx`.
- [ ] Implement the new layouts as separate components under `src/compositions/layouts/`. Start with `code-callout` and `quote-hero` — those are the two with the highest visual contrast vs the existing one.
- [ ] Update `author-video-topic` skill so it picks a layout per scene based on the narrative beat (hook = `quote-hero`, demo = `code-typewriter`, comparison = `code-diff`, etc.).

### Files

- `src/types/content.ts`
- `src/compositions/CodeRunner.tsx` → becomes a dispatcher
- `src/compositions/layouts/*` (new directory)
- `.agents/skills/author-video-topic/SKILL.md` (update layout selection guidance)

### References

- [Remotion `<AbsoluteFill>`](https://www.remotion.dev/docs/absolute-fill) — layout primitive
- [`@remotion/shapes`](https://www.remotion.dev/shapes) — for callout boxes, arrows in `code-diff`
- [`@remotion/paths`](https://www.remotion.dev/paths) — for animated SVG arrows
- Style inspiration:
  - Fireship's "100 seconds" videos — quote-hero layout examples
  - Theo's t3.gg shorts — code-callout reactive highlighting
  - [Remotion showcase](https://www.remotion.dev/showcase) — sort by recent

### Done when

- At least 3 layouts exist and can be selected via `step.layout`.
- One existing topic is migrated to use a mix of at least 2 layouts and the result is visibly less templated.
- The skill's prompt rules document when each layout is appropriate.

---

## Phase 3 — Hook scene + sound design

**Why this matters.** Retention on Reels/TikTok/Shorts is decided in the first 1.5 seconds. Right now the videos open with a calm title fade — that's a scroll signal on social platforms. A punchy hook + audio dramatically changes drop-off rate. Sound design alone is the difference between "deck recording" and "produced video", independent of any visual change.

### Tasks (hook)

- [ ] Add a new optional `hook?: { duration: number; text: string; subtext?: string; layout?: 'shock' | 'question' | 'mistake' }` to `TopicMetadata`.
- [ ] Render the hook as its own `<Sequence from={0} durationInFrames={...}>` before the existing content sequence.
- [ ] Implement a `HookScene` component with a large punchy text and an entry that punches (`spring` + scale 0.7 → 1.05 → 1).
- [ ] Skill: `author-video-topic` should plan a 1.2–2s hook for every video. The hook is the "why should I keep watching" line.

### Tasks (audio)

- [ ] Add an SFX library under `public/sfx/`. Minimum set: `whoosh.mp3`, `click.mp3`, `pop.mp3`, `success.mp3`, `error.mp3`. Source: [Mixkit free SFX](https://mixkit.co/free-sound-effects/) or [Zapsplat](https://www.zapsplat.com/).
- [ ] Add a background music slot: `TopicMetadata.backgroundMusicUrl?: string` (or `staticFile`). Render via `<Audio volume={0.15}>` at the layout root.
- [ ] Add per-step transition SFX: when a `<Sequence>` starts, play a `<Audio src={whoosh}>` synced to its start frame. Only on transitions that have visual motion.
- [ ] Optional: BPM-detect the chosen background track with `@remotion/media-utils` (`getAudioData`) and align scene transitions to beats.
- [ ] Typewriter sound: every ~3 characters trigger a soft `click.mp3` with `<Audio>` and `startFrom`. Volume around 0.25.

### Files

- `src/compositions/components/HookScene.tsx` (new)
- `src/compositions/ShortVideoLayout.tsx` (mount hook, BG music, SFX)
- `src/sfx.ts` (new) — central SFX path constants
- `public/sfx/*` (new)
- `src/types/content.ts`

### References

- [Remotion `<Audio>`](https://www.remotion.dev/docs/audio) — audio component
- [`<Audio>` props](https://www.remotion.dev/docs/audio/props) — `startFrom`, `endAt`, `volume`
- [`@remotion/media-utils`](https://www.remotion.dev/media-utils) — `getAudioData`, `useAudioData`
- [Beat-syncing tutorial](https://www.remotion.dev/docs/audio/visualization) — visualize and snap to audio
- Free music: [Pixabay Music](https://pixabay.com/music/), [YouTube Audio Library](https://www.youtube.com/audiolibrary)

### Done when

- Every video has a hook scene (≤ 2s) before the topic title.
- Background music plays under the whole video at low volume.
- At least the most prominent transition has an SFX cue.

---

## Phase 4 — Code-level dynamism

**Why this matters.** Code is the protagonist of these videos. Right now it gets typed once and stays still. Reactive highlighting (the token "filter" glows when the narration says "filter") creates a tight bond between audio and visual that's hard to fake with motion alone.

### Tasks

- [ ] **Token highlight reactive.** Inside `code-callout` layout: parse Prism tokens once. When a step has `highlightTokens?: { token: string; fromFrame: number; toFrame: number }[]`, animate a translucent rounded rect behind the matched token (scale + opacity spring).
- [ ] **Code morphing.** Implement `code-diff` such that the "before" line morphs character-by-character into the "after" line, not just fades. Use a longest-common-subsequence diff to know which chars stay vs change.
- [ ] **Auto-scroll long code.** When a `codeSnippet` exceeds the container height, anchor a scrolling viewport to follow the typewriter cursor (translate the `<pre>` upward as `visibleChars` grows).
- [ ] **Inline annotations.** Allow per-line callouts: `codeAnnotations?: { line: number; text: string; position: 'right' | 'below' }[]`. Render as `@remotion/shapes` bubbles with a connecting line.

### Files

- `src/compositions/layouts/CodeCalloutLayout.tsx`
- `src/compositions/layouts/CodeDiffLayout.tsx`
- `src/compositions/components/CodeViewport.tsx` (auto-scroll container)
- `src/compositions/components/CodeAnnotation.tsx`
- `src/utils/string-diff.ts`

### References

- [Prism token model](https://prismjs.com/extending.html#api) — how tokens are emitted
- [`prism-react-renderer` render props](https://github.com/FormidableLabs/prism-react-renderer#basic-usage) — tokens, getTokenProps
- [Code Hike](https://codehike.org/) — battle-tested patterns for reactive code (read-only inspiration, do not depend on it)
- [`diff` package](https://github.com/kpdecker/jsdiff) — fast LCS diff if you want to outsource it
- [Remotion `useCurrentFrame()`](https://www.remotion.dev/docs/use-current-frame) — driving per-frame animation

### Done when

- A `code-callout` step exists in at least one published topic and the highlight rect tracks a token through the narration.
- A `code-diff` step morphs between two snippets visibly (not just cross-fades).

---

## Phase 5 — Decorative / atmospheric layer

**Why this matters.** Even with rich motion, a flat solid background reads as "tool generated". A subtle living background (noise, drifting shapes, depth) is what makes the difference between a Remotion render and something that looks like After Effects.

### Tasks

- [ ] Add a `Background` component at the bottom of the layout's z-index stack. Options selectable via a new optional `TopicMetadata.background?: 'solid' | 'noise' | 'gradient-drift' | 'grid' | 'particles'`. Default `'gradient-drift'`.
- [ ] **`gradient-drift`** — two radial gradients sliding in opposite directions, blend mode `screen`, very low opacity. Cheap and looks expensive.
- [ ] **`noise`** — `@remotion/noise` perlin field, used as a CSS `mix-blend-mode: overlay` layer at ~10% opacity.
- [ ] **`grid`** — subtle 50px grid with `linear-gradient`, slow vertical scroll.
- [ ] **`particles`** — 8-15 small shapes from `@remotion/shapes` drifting with sine motion, layered behind the code panel.
- [ ] Add parallax: foreground layer (TitleBanner, BrandFooter) moves 1.0x with a mock "camera"; content moves 0.85x; background moves 0.5x. Even a static camera with subtle parallax sells depth.

### Files

- `src/compositions/components/Background.tsx`
- `src/compositions/components/backgrounds/{Solid,Noise,GradientDrift,Grid,Particles}.tsx`
- `src/types/content.ts`

### References

- [`@remotion/noise`](https://www.remotion.dev/noise) — perlin/simplex noise
- [`@remotion/shapes`](https://www.remotion.dev/shapes) — Circle, Triangle, Rect, etc.
- [CSS blend modes](https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode) — overlay, screen, multiply
- [Particle tutorial](https://www.remotion.dev/learn/2022/05/05/animating-properties) — frame-driven motion

### Done when

- At least 3 background variants exist and the project default is no longer a solid color.
- A side-by-side test confirms the background reads as "alive" without distracting from the code.

---

## Phase 6 — TTS narration pipeline

**Why this matters.** Right now `narrationText` exists in the data but only appears as on-screen text. Reading text on a phone is fundamentally different from listening to it. A TTS layer turns the videos from "read this" into "watch this with sound on" — which is the platform-native consumption mode.

### Decision points up front

- **Provider:** ElevenLabs (best quality, paid per char) vs OpenAI TTS (cheaper, good quality) vs local (`piper-tts`, free, lower quality). Start with OpenAI TTS for cost/quality balance.
- **When to generate:** at codegen time (pre-render) → fast renders, audio cached as files. Generate-on-render is wasteful.
- **Where to store:** `public/tts/<topic>-<version>/<step-id>.mp3`. Gitignore the directory; rely on the script to regenerate.

### Tasks

- [ ] Add `scripts/generate-tts.ts`: reads every `narrationText`, hits the chosen provider, writes MP3s into `public/tts/...`, patches `audioUrl` in the data file _or_ relies on a deterministic naming convention so the layout can find it.
- [ ] Add `pnpm tts <topic-id>` script.
- [ ] In `CodeRunner`, when `step.audioUrl` is present, render `<Audio src={staticFile(step.audioUrl)} startFrom={0}>` synced to the step's sequence.
- [ ] **Critical:** the step's `durationInSeconds` must match the audio duration. Either (a) the TTS script writes the actual duration back into the data file, or (b) `calculateMetadata` reads each audio file's duration via `@remotion/media-utils` and overrides `durationInSeconds`. Option (b) is more robust.
- [ ] Add an env-var-based switch so the TTS script can be skipped in CI (where you don't want to call paid APIs).

### Files

- `scripts/generate-tts.ts` (new)
- `src/compositions/components/CodeRunner.tsx`
- `.env.example` (document `OPENAI_API_KEY` / `ELEVENLABS_API_KEY`)
- `package.json`

### References

- [OpenAI TTS](https://platform.openai.com/docs/guides/text-to-speech) — `audio.speech.create`, voices list
- [ElevenLabs API](https://elevenlabs.io/docs/api-reference/text-to-speech) — text-to-speech endpoint
- [Piper TTS](https://github.com/rhasspy/piper) — local fallback
- [`@remotion/media-utils` `getAudioDurationInSeconds`](https://www.remotion.dev/docs/media-utils/get-audio-duration-in-seconds)
- [Remotion `<Audio>`](https://www.remotion.dev/docs/audio)
- [`staticFile()`](https://www.remotion.dev/docs/staticfile) — referencing files in `public/`

### Done when

- Running `pnpm tts conceptos--array-filter--v1` produces MP3s under `public/tts/...`.
- A rendered video has spoken narration synced to each step.
- `durationInSeconds` per step matches actual audio length (no awkward silence at the end of a step).

---

## Phase 7 — Long-tail polish

Quality-of-life items that don't fit in a larger phase but add up.

- [ ] **Asymmetric layouts** — break the centered-vertical-axis default. Try a variant where the code panel hugs the left edge and a callout column lives on the right.
- [ ] **Micro-motion utility** — a `useIdleMotion()` hook returning `{ x, y, rotation }` with sine-based drift. Apply to TitleBanner, BrandFooter, decorative shapes.
- [ ] **Aspect-aware safe areas** — currently `safePaddingX` is symmetric. Different platforms have different safe zones (Instagram Stories has top/bottom UI overlap). Add per-platform safe-area metrics.
- [ ] **Lottie icons** — `@remotion/lottie` for animated icons (loading spinner, checkmark, warning). [LottieFiles](https://lottiefiles.com/) has free packs.
- [ ] **Particle burst on success/error scenes** — when a `quote-hero` is celebratory or alarming, burst a few `@remotion/shapes` particles outward with `spring` + decay.
- [ ] **Per-topic format opt-out** — currently every topic renders to all 4 formats. Add `TopicMetadata.formats?: FormatId[]` to opt-in only to relevant ones.
- [ ] **Parallel render in `render-topic`** — today it's sequential. With `child_process` and a worker pool the 4 formats can render concurrently. Trade-off: peak CPU/memory.
- [ ] **Render artifacts indexer** — write `out/INDEX.md` after each batch render with thumbnails (single-frame PNGs) and links. Makes it easy to QA the batch before uploading.

---

## Cross-cutting references

### Remotion docs (most relevant)

- [Animation overview](https://www.remotion.dev/docs/animating-properties)
- [`spring()`](https://www.remotion.dev/docs/spring) · [Spring playground](https://springs.pomb.us/)
- [`interpolate()`](https://www.remotion.dev/docs/interpolate)
- [`Easing`](https://www.remotion.dev/docs/easing)
- [`<Sequence>`](https://www.remotion.dev/docs/sequence) · [`<Series>`](https://www.remotion.dev/docs/series)
- [`<TransitionSeries>`](https://www.remotion.dev/docs/transitions/transitionseries)
- [`<Audio>`](https://www.remotion.dev/docs/audio) · [`<Video>`](https://www.remotion.dev/docs/video) · [`<Img>`](https://www.remotion.dev/docs/img)
- [`useVideoConfig()`](https://www.remotion.dev/docs/use-video-config) · [`useCurrentFrame()`](https://www.remotion.dev/docs/use-current-frame)
- [`staticFile()`](https://www.remotion.dev/docs/staticfile)

### Remotion packages

- [`@remotion/transitions`](https://www.remotion.dev/transitions) — scene transitions
- [`@remotion/shapes`](https://www.remotion.dev/shapes) — SVG primitives
- [`@remotion/paths`](https://www.remotion.dev/paths) — SVG path morphing
- [`@remotion/noise`](https://www.remotion.dev/noise) — perlin/simplex textures
- [`@remotion/lottie`](https://www.remotion.dev/lottie) — Lottie animations
- [`@remotion/media-utils`](https://www.remotion.dev/media-utils) — audio/video analysis
- [`@remotion/google-fonts`](https://www.remotion.dev/google-fonts) — typography (already installed)
- [`@remotion/skia`](https://www.remotion.dev/skia) — heavier, more powerful canvas (optional, advanced)

### Animation principles

- ["12 principles of animation"](https://en.wikipedia.org/wiki/Twelve_basic_principles_of_animation) — the canon
- [Easings.net](https://easings.net/) — pick easings visually
- [Spring physics primer](https://www.joshwcomeau.com/animation/a-friendly-introduction-to-spring-physics/) — Josh Comeau
- [Material Design motion](https://m3.material.io/styles/motion/overview) — duration / easing guidance

### Style inspiration (study the cuts, not just the look)

- [Fireship](https://www.youtube.com/@Fireship) — pacing, sound design, asymmetric layouts
- [Theo Browne](https://www.youtube.com/@t3dotgg) — code callouts, reactive highlight
- [Web Dev Simplified](https://www.youtube.com/@WebDevSimplified) — clean diffs, before/after
- [Remotion showcase](https://www.remotion.dev/showcase) — what's possible with the same stack
- [Awwwards motion design](https://www.awwwards.com/awwwards/collections/motion-graphics/) — broader reference

### Free assets

- SFX: [Mixkit](https://mixkit.co/free-sound-effects/) · [Zapsplat](https://www.zapsplat.com/) · [Freesound](https://freesound.org/)
- Music: [Pixabay Music](https://pixabay.com/music/) · [YouTube Audio Library](https://www.youtube.com/audiolibrary) · [Uppbeat](https://uppbeat.io/)
- Lottie: [LottieFiles](https://lottiefiles.com/) · [IconScout Lottie](https://iconscout.com/lotties)
- Icons: [Lucide](https://lucide.dev/) · [Heroicons](https://heroicons.com/)

---

## How to use this document

1. Pick the lowest-numbered phase that's still `Not started`.
2. Read its **Why** and **Done when** sections — don't start until you can argue why the result will matter.
3. Walk through **Tasks** as checkboxes. Update the status in the overview table to `In progress`.
4. When the **Done when** criteria are met, change status to `Done` and write a one-line note under the phase (e.g. _"Done 2026-07-12 — transitions used: fade + slide. Spring config landed in `src/motion.ts`."_).
5. If a phase reveals it needs to be split, split it. Don't bottle up partial wins.

Don't treat the order as sacred — Phase 3 (sound) is a strong candidate to move up if a specific video needs it. Just don't skip Phase 1: every later phase benefits from springs being already in place.
