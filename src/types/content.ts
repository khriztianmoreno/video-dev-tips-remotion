import type { Theme } from '../theme';

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
  narrationText: string;
  audioUrl?: string;
};

export type TopicMetadata = {
  id: string;
  version: string;
  category: string;
  displayTitle: string;
  theme?: Partial<Theme>;
  timeline: VideoStep[];
};
