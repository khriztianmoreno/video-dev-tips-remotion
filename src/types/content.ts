import type { Theme } from '../theme';
import type { BackgroundKind } from '../backgrounds';

/** Controlled vocabulary of background-music moods (mapped to Epidemic Sound genre slugs). */
export type BgMusicMood =
  | 'lo-fi-hip-hop'
  | 'lofi-house'
  | 'ambient-tech'
  | 'synthwave-cyberpunk';

/** Per-step visual template. Defaults to `code-typewriter` (the original layout). */
export type StepLayout =
  | 'code-typewriter'
  | 'code-callout'
  | 'quote-hero'
  | 'code-diff'
  | 'terminal'
  | 'data-viz'
  | 'file-tree';

/** Per-step incoming transition (applied between consecutive content scenes). */
export type StepTransition = 'fade' | 'slide-left' | 'wipe' | 'flip';

export type VideoStep = {
  id: string;
  durationInSeconds: number;
  title?: string;
  codeSnippet?: string;
  language?: 'typescript' | 'javascript' | 'bash';
  /**
   * Optional image shown in the scene. Either a path relative to `public/`
   * (resolved with `staticFile`) or an absolute `http(s)` URL. Coexists with
   * `codeSnippet` and `narrationText`; rendered fitted to the content area.
   */
  imageUrl?: string;
  /**
   * Optional zoom/pan applied to `imageUrl` (Ken Burns + region focus) so small
   * UI detail is readable on mobile. `scale` is the zoom factor (e.g. 1.8) and
   * `x`/`y` are the focus point in 0..1 (default centered).
   */
  imageFocus?: { scale?: number; x?: number; y?: number };
  /**
   * Optional screen-recording clip (path relative to `public/` or `http(s)` URL),
   * rendered with `<OffthreadVideo>`. Takes visual priority over `imageUrl`.
   */
  videoUrl?: string;
  narrationText: string;
  /**
   * Optional voiceover audio (path relative to `public/` or `http(s)` URL).
   * When set, the scene duration is derived from the audio length (see Root).
   */
  audioUrl?: string;
  /**
   * Visual template for this step. Defaults to `code-typewriter` (the original
   * typewriter + image + narration stack). Other layouts unlock different shapes.
   */
  layout?: StepLayout;
  /**
   * Incoming transition for this step. Applies only when the step is not the
   * first in the timeline (the first step has no incoming transition). Default
   * `fade`. Mix at most 2-3 kinds across one video.
   */
  transition?: StepTransition;
  /**
   * `code-callout` only: substring (or token) to highlight in `codeSnippet`.
   * A translucent rounded rect animates over the first occurrence in sync
   * with the narration. Case-sensitive.
   */
  calloutToken?: string;
  /**
   * `quote-hero` only: the hero phrase. Falls back to `narrationText` when
   * unset, but a punchy distilled version reads better.
   */
  quote?: string;
  /**
   * `quote-hero` only: small attribution line under the quote (e.g. author,
   * source, "— me, every Tuesday").
   */
  quoteAttribution?: string;
  /**
   * `terminal` only: ordered list of terminal lines, revealed sequentially.
   * Each entry can override the prompt (default `$` for commands, `#` for
   * comments); `output` is the line body (single line, no `\n`).
   */
  terminalLines?: { prompt?: string; output: string }[];
  /**
   * `code-diff` only: the "before" snippet (left/top panel, vermilion border).
   * Falls back to `codeSnippet` when unset.
   */
  codeBefore?: string;
  /**
   * `code-diff` only: the "after" snippet (right/bottom panel, mint border).
   */
  codeAfter?: string;
};

/** Optional pre-roll hook scene — first 1-2s "why should I keep watching" beat. */
export type Hook = {
  durationInSeconds: number;
  text: string;
  /** Optional kicker under the main hero text. */
  subtext?: string;
  /**
   * Visual variant. `shock` = mint accent, `question` = primary with `?` motif,
   * `mistake` = vermilion accent (warning vibe). Default `shock`.
   */
  variant?: 'shock' | 'question' | 'mistake';
};

export type TopicMetadata = {
  id: string;
  version: string;
  category: string;
  displayTitle: string;
  theme?: Partial<Theme>;
  /**
   * Optional open question shown on the outro to drive comments. Falls back to a
   * generic default when omitted.
   */
  ctaQuestion?: string;
  /**
   * Optional pre-roll hook (≤ 2s). Renders before the content scenes and the
   * title banner. Critical for short-form retention.
   */
  hook?: Hook;
  /**
   * Optional background-music mood. The `scripts/fetch-music.ts` AOT step uses it to fetch a
   * track from Epidemic Sound into `public/music/` and record it in the music manifest. When
   * set, this music takes precedence over the global `src/audio.ts` track.
   */
  bgMusicMood?: BgMusicMood;
  /**
   * Optional manual override: an exact background-music file (path relative to `public/` or
   * an `http(s)` URL). When set it wins over `bgMusicMood`/the fetched manifest, and
   * `scripts/fetch-music.ts` skips this topic. Use to pin a specific track.
   */
  bgMusicFile?: string;
  /**
   * Optional atmospheric background variant rendered behind every content scene
   * (hook and outro keep their solid background). Defaults to `gradient-drift`.
   * Set `solid` to disable for a clean, flat look.
   */
  background?: BackgroundKind;
  timeline: VideoStep[];
};
