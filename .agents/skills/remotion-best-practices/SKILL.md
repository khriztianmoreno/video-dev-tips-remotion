---
name: remotion-best-practices
description: Best practices for Remotion - Video creation in React
metadata:
  tags: remotion, video, react, animation, composition
---

## When to use

Use this skills whenever you are dealing with Remotion code to obtain the domain-specific knowledge.

## Project conventions (video-dev-tips-remotion)

**Read this section before writing any new animation, layout, transition, or composition
in this repo.** The project already has its own motion language and component architecture.
Reuse the existing primitives — don't reintroduce ad-hoc patterns. This section overrides
the generic Remotion guidance below where they disagree.

### Motion language (`src/motion.ts`)

- `springs.{enter, enterSubtle, punch, settle}` — canonical `spring()` configs:
  - `enter` — default entry for content (title, code, narration).
  - `enterSubtle` — critical-path entries that should not steal attention.
  - `punch` — hooks, hot-takes, takeaways. Loud overshoot, lands fast.
  - `settle` — idle micro-motion / breathing.
- `outExpo` = `Easing.bezier(0.22, 1, 0.36, 1)`. Default easing for any continuous
  `interpolate` in this project.
- `TRANSITION_FRAMES = 8` — cross-fade overlap between adjacent content scenes. Match
  this when computing duration adjustments; `Root.tsx`/`calculateMetadata` already
  subtracts `(N-1) * TRANSITION_FRAMES` from the total.
- `resolveTransition(kind)` — maps `StepTransition` (`fade`/`slide-left`/`wipe`/`flip`)
  to a Remotion `TransitionPresentation`. Use this — do **not** import presentations
  from `@remotion/transitions/*` elsewhere.

**Forbidden:** linear `interpolate(frame, [0, N], [0, 1])` for entry animations.
Replace with `spring({ frame, fps, config: springs.enter })`. Linear `interpolate` is
allowed only for continuous drives (typewriter progress, Ken Burns, opacity tracks
chained to a time offset) and even there should pass `easing: outExpo`.

### Layout dispatcher

Per-step visual templates live under `src/compositions/layouts/`:

- `CodeTypewriterLayout.tsx` — default; typewriter code + optional image/video + narration.
- `CodeCalloutLayout.tsx` — full code panel + mint glow highlight on `step.calloutToken`.
- `QuoteHeroLayout.tsx` — single hero phrase, no code panel, springy `punch` entry.
- `TerminalLayout.tsx` — CLI panel (dark bg, mint prompt, monospace), reveals `step.terminalLines` sequentially.
- `CodeDiffLayout.tsx` — before/after panels (vermilion vs mint border) with an arrow that draws between.

The dispatcher is `src/compositions/components/CodeRunner.tsx`. To add a new layout:

1. Add the value to `StepLayout` in `src/types/content.ts`.
2. Add any layout-specific fields to `VideoStep` (optional).
3. Create the layout component under `src/compositions/layouts/`.
4. Register the `case` in `CodeRunner`'s switch.

Layouts `data-viz` and `file-tree` are reserved in the type but **not yet implemented**.
Implement them following the same pattern when needed.

### Atmospheric background

`src/compositions/components/Background.tsx` is a dispatcher mounted as the first child
of `ShortVideoLayout`'s root `AbsoluteFill` (bottom of z-stack). Variants live under
`src/compositions/components/backgrounds/`:

- `SolidBackground.tsx` — flat `theme.backgroundColor`.
- `GradientDriftBackground.tsx` (default) — two radial gradients sliding in opposite directions; sine-driven.
- `NoiseBackground.tsx` — SVG `<feTurbulence>` overlay at ~8% opacity, `mix-blend-mode: overlay`. Static texture.
- `GridBackground.tsx` — 60px grid scrolling vertically at 18 px/s.
- `ParticlesBackground.tsx` — 14 circles distributed via the golden angle, each on its own sine orbit.

The background variant is `TopicMetadata.background` (defaults to `gradient-drift`).
**Do not paint a solid `backgroundColor` on `ShortVideoLayout`'s root `AbsoluteFill`** —
that would cover the Background. Hook and outro scenes intentionally paint their own
opaque bg so the variant only reads during content scenes.

### Persistent scene chrome (inside content `<Sequence>`)

- `TitleBanner` — `{ Title };` block at the top. Springs in (`springs.enter`).
- `BrandFooter` — bottom-right Cloudinary logo. Springs in (`springs.enterSubtle`).

Both render alongside the `<TransitionSeries>`, not inside it, so they persist across
all content scenes.

### Independent scenes (own `<Sequence>`s in `ShortVideoLayout`)

- `HookScene` — pre-roll fed by `TopicMetadata.hook`. Renders BEFORE the title banner.
  No title banner, no footer.
- `OutroScene` — appended automatically by the render pipeline (`src/outro.ts`,
  `withOutro`). No title banner, no footer. Edit the social handle / image / heart /
  follow copy in `src/outro.ts` — don't reimplement.

### Audio plumbing (already wired)

- **Background music** precedence: `bgMusicFile > per-topic manifest (bgMusicMood) > global (src/audio.ts) > none`. Resolved in `ShortVideoLayout`. Do not mount a second `<Audio>` for BG music.
- **SFX**: `src/sfx.ts` exports typed paths under `public/sfx/`. Wire `<Audio>` for SFX
  only AFTER the asset files exist (otherwise renders 404). `public/sfx/README.md` lists
  the expected files and free sources.
- **Per-step voiceover**: `step.audioUrl`. When set, `calculateMetadata` derives the
  scene duration from the audio length via `@remotion/media-utils`. Don't hand-tune
  `durationInSeconds` for those scenes.

### Responsive sizing

`src/layout-metrics.ts` exports `getLayoutMetrics(width, height)` → a `LayoutMetrics`
object. Every layout component receives `metrics: LayoutMetrics` and uses it for fonts,
paddings, gaps, radii. **No hardcoded pixel sizes** for typography or spacing in layout
components — would break the square/landscape/portrait variants emitted by
`src/Root.tsx`.

### Theme

`src/theme.ts` exports `defaultTheme` (brand palette) + `resolveTheme(override)`.
`TopicMetadata.theme?: Partial<Theme>` allows per-topic overrides.

### Transitions

Content scenes are wrapped in `<TransitionSeries>` inside `ShortVideoLayout`. Each step's
incoming transition is `step.transition` resolved via `resolveTransition()`. **Do not add
cross-fades manually with `interpolate`** between scenes — use the existing wrapper.

### Composition multiplexing

`src/Root.tsx` emits `topics × formats` (4 formats per topic: vertical, square,
landscape, portrait). All sizing must be format-agnostic — rely on `getLayoutMetrics()`
for any width/height-dependent value.

### What NOT to do

- Don't add new linear `interpolate(frame, [0, N], [0, 1])` for entries — use `spring`.
- Don't import presentation factories (`@remotion/transitions/fade`, `/slide`, …)
  outside `src/motion.ts`. Go through `resolveTransition`.
- Don't reinvent the outro, hook, brand footer, or title banner.
- Don't hardcode dimensions in a layout — use `getLayoutMetrics`.
- Don't write to `src/_generated/` (codegen artifact, gitignored).
- Don't add background music wiring per-step or per-component — it's already mounted in
  `ShortVideoLayout`.
- Don't mount `<Audio>` for SFX files that haven't been dropped in `public/sfx/` —
  renders will 404. Add the wire only after the asset lands.

### Where to look (file map)

| What | File |
|---|---|
| Spring configs, easing, transition resolver | `src/motion.ts` |
| Layout dispatcher | `src/compositions/components/CodeRunner.tsx` |
| Layout components | `src/compositions/layouts/*` |
| Title banner / brand footer / outro / hook | `src/compositions/components/{TitleBanner,BrandFooter,OutroScene,HookScene}.tsx` |
| Background dispatcher + variants | `src/compositions/components/Background.tsx`, `src/compositions/components/backgrounds/*` |
| Background catalog | `src/backgrounds.ts` |
| Responsive metrics | `src/layout-metrics.ts` |
| Theme | `src/theme.ts` |
| Output formats catalog | `src/formats.ts` |
| Music resolution | `src/music.ts`, `src/music-resolve.ts`, `src/audio.ts` |
| SFX catalog | `src/sfx.ts` |
| Types | `src/types/content.ts` |
| Root + `calculateMetadata` | `src/Root.tsx` |

## New project setup

When in an empty folder or workspace with no existing Remotion project, scaffold one using:

```bash
npx create-video@latest --yes --blank --no-tailwind my-video
```

Replace `my-video` with a suitable project name.

## Designing a video

Animate properties using `useCurrentFrame()` and `interpolate()`. Use Easing to customize the timing of the animation.

```tsx
import { useCurrentFrame, Easing } from "remotion";

export const FadeIn = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, 2 * fps], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return <div style={{ opacity }}>Hello World!</div>;
};
```

CSS transitions or animations are FORBIDDEN - they will not render correctly.  
Tailwind animation class names are FORBIDDEN - they will not render correctly.

Place assets in the `public/` folder at your project root.

Use `staticFile()` to reference files from the `public/` folder.

Add images using the `<Img>` component:

```tsx
import { Img, staticFile } from "remotion";

export const MyComposition = () => {
  return <Img src={staticFile("logo.png")} style={{ width: 100, height: 100 }} />;
};
```

Add videos using the `<Video>` component from `@remotion/media`:

```tsx
import { Video } from "@remotion/media";
import { staticFile } from "remotion";

export const MyComposition = () => {
  return <Video src={staticFile("video.mp4")} style={{ opacity: 0.5 }} />;
};
```

Add audio using the `<Audio>` component from `@remotion/media`:

```tsx
import { Audio } from "@remotion/media";
import { staticFile } from "remotion";

export const MyComposition = () => {
  return <Audio src={staticFile("audio.mp3")} />;
};
```

Assets can be also referenced as remote URLs:

```tsx
import { Video } from "@remotion/media";

export const MyComposition = () => {
  return <Video src="https://remotion.media/video.mp4" />
};
```

To delay content wrap it in `<Sequence>` and use `from`.
To limit the duration of an element, use `durationInFrames` of `<Sequence>`.
`<Sequence>` by default is an absolute fill. For inline content, use `layout="none"`.

```tsx
import { Sequence } from "remotion";

export const Title = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, 2 * fps], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return <div style={{ opacity }}>Title</div>;
};

export const Subtitle = () => {
  return <div>Subtitle</div>;
};

const Main = () => {
  const {fps} = useVideoConfig();

  return (
    <AbsoluteFill>
      <Sequence>
        <Background />
      </Sequence>
      <Sequence from={1 * fps} durationInFrames={2 * fps} layout="none">
        <Title />
      </Sequence>
      <Sequence from={2 * fps} durationInFrames={2 * fps} layout="none">
        <Subtitle />
      </Sequence>
    </AbsoluteFill>
  );
}
```

The width, height, fps, and duration of a video is defined in `src/Root.tsx`:

```tsx
import { Composition } from "remotion";
import { MyComposition } from "./MyComposition";

export const RemotionRoot = () => {
  return (
    <Composition
      id="MyComposition"
      component={MyComposition}
      durationInFrames={100}
      fps={30}
      width={1080}
      height={1080}
    />
  );
};
```

Metadata can also be calculated dynamically:

```tsx
import { Composition, CalculateMetadataFunction } from "remotion";
import { MyComposition, MyCompositionProps } from "./MyComposition";

const calculateMetadata: CalculateMetadataFunction<
  MyCompositionProps
> = async ({ props, abortSignal }) => {
  const data = await fetch(`https://api.example.com/video/${props.videoId}`, {
    signal: abortSignal,
  }).then((res) => res.json());

  return {
    durationInFrames: Math.ceil(data.duration * 30),
    props: {
      ...props,
      videoUrl: data.url,
    },
    width: 1080,
    height: 1080,
  };
};

export const RemotionRoot = () => {
  return (
    <Composition
      id="MyComposition"
      component={MyComposition}
      fps={30}
      width={1080}
      height={1080}
      defaultProps={{ videoId: "abc123" }}
      calculateMetadata={calculateMetadata}
    />
  );
};
```

## Starting preview

Start the Remotion Studio to preview a video:

```bash
npx remotion studio
```

## Optional: one-frame render check

You can render a single frame with the CLI to sanity-check layout, colors, or timing.  
Skip it for trivial edits, pure refactors, or when you already have enough confidence from Studio or prior renders.

```bash
npx remotion still [composition-id] --scale=0.25 --frame=30
```

At 30 fps, `--frame=30` is the one-second mark (`--frame` is zero-based).

## Captions

When dealing with captions or subtitles, load the [./rules/subtitles.md](./rules/subtitles.md) file for more information.

## Using FFmpeg

For some video operations, such as trimming videos or detecting silence, FFmpeg should be used. Load the [./rules/ffmpeg.md](./rules/ffmpeg.md) file for more information.

## Silence detection

When needing to detect and trim silent segments from video or audio files, load the [./rules/silence-detection.md](./rules/silence-detection.md) file.

## Audio visualization

When needing to visualize audio (spectrum bars, waveforms, bass-reactive effects), load the [./rules/audio-visualization.md](./rules/audio-visualization.md) file for more information.

## Sound effects

When needing to use sound effects, load the [./rules/sfx.md](./rules/sfx.md) file for more information.

## 3D content

See [rules/3d.md](rules/3d.md) for 3D content in Remotion using Three.js and React Three Fiber.

## Advanced audio

See [rules/audio.md](rules/audio.md) for advanced audio features like trimming, volume, speed, pitch.

## Dynamic duration, dimensions and data

See [rules/calculate-metadata.md](rules/calculate-metadata.md) for dynamically set composition duration, dimensions, and props.

## Advanced compositions

See [rules/compositions.md](rules/compositions.md) for how to define stills, folders, default props and for how to nest compositions.

## Google Fonts

Is the recommended way to load fonts in Remotion. See [rules/google-fonts.md](rules/google-fonts.md) for how to load Google Fonts.

## Local fonts

See [rules/local-fonts.md](rules/local-fonts.md) for how to load local fonts.

## Getting audio duration

See [rules/get-audio-duration.md](rules/get-audio-duration.md) for getting the duration of an audio file in seconds with Mediabunny.

## Getting video dimensions

See [rules/get-video-dimensions.md](rules/get-video-dimensions.md) for getting the width and height of a video file with Mediabunny.

## Getting video duration

See [rules/get-video-duration.md](rules/get-video-duration.md) for getting the duration of a video file in seconds with Mediabunny.

## GIFs

See [rules/gifs.md](rules/gifs.md) for how to display GIFs synchronized with Remotion's timeline.

## Advanced Images

See [rules/images.md](rules/images.md) for sizing and positioning images, dynamic image paths, and getting image dimensions.

## Light leaks

See [rules/light-leaks.md](rules/light-leaks.md) for light leak overlay effects using `@remotion/light-leaks`.

## Lottie animations

See [rules/lottie.md](rules/lottie.md) for embedding Lottie animations in Remotion.

## HTML in canvas

See [rules/html-in-canvas.md](rules/html-in-canvas.md) if you need to render HTML into a `<canvas>` to apply 2D or WebGL effects via `<HtmlInCanvas>`.

## Measuring DOM nodes

See [rules/measuring-dom-nodes.md](rules/measuring-dom-nodes.md) for measuring DOM element dimensions in Remotion.

## Measuring text

See [rules/measuring-text.md](rules/measuring-text.md) for measuring text dimensions, fitting text to containers, and checking overflow.

## Advanced sequencing

See [rules/sequencing.md](rules/sequencing.md) for more sequencing patterns - delay, trim, limit duration of items.

## TailwindCSS

See [rules/tailwind.md](rules/tailwind.md) for using TailwindCSS in Remotion.

## Text animations

See [rules/text-animations.md](rules/text-animations.md) for typography and text animation patterns.

## Advanced timing

See [rules/timing.md](rules/timing.md) for advanced timing with `interpolate` and Bézier easing, and springs.

## Transitions

See [rules/transitions.md](rules/transitions.md) for scene transition patterns.

## Transparent videos

See [rules/transparent-videos.md](rules/transparent-videos.md) for rendering out a video with transparency.

## Trimming

See [rules/trimming.md](rules/trimming.md) for trimming patterns - cutting the beginning or end of animations.

## Advanced Videos

See [rules/videos.md](rules/videos.md) for advanced knowledge about embedding videos - trimming, volume, speed, looping, pitch.

## Parameterized videos

See [rules/parameters.md](rules/parameters.md) for making a composition parametrizable by adding a Zod schema.

## Maps

For simple maps with little flyovers, consider using static map images.
For complex maps with animated routes or flyovers, load the maps rule: [rules/maplibre.md](rules/maplibre.md)

## Voiceover

See [rules/voiceover.md](rules/voiceover.md) for adding AI-generated voiceover to Remotion compositions using ElevenLabs TTS.
