import type { Theme } from "../theme";

/** Controlled vocabulary of background-music moods (mapped to Epidemic Sound genre slugs). */
export type BgMusicMood =
  | "lo-fi-hip-hop"
  | "lofi-house"
  | "ambient-tech"
  | "synthwave-cyberpunk";

export type VideoStep = {
  id: string;
  durationInSeconds: number;
  title?: string;
  codeSnippet?: string;
  language?: "typescript" | "javascript" | "bash";
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
   * Optional background-music mood. The `scripts/fetch-music.ts` AOT step uses it to fetch a
   * track from Epidemic Sound into `public/music/` and record it in the music manifest. When
   * set, this music takes precedence over the global `src/audio.ts` track.
   */
  bgMusicMood?: BgMusicMood;
  timeline: VideoStep[];
};
