import type { Theme } from '../theme';

export type VideoStep = {
  id: string;
  durationInSeconds: number;
  title?: string;
  codeSnippet?: string;
  language?: 'typescript' | 'javascript' | 'bash';
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
