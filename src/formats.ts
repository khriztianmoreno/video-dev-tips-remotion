export type FormatId = 'vertical' | 'square' | 'landscape' | 'portrait';

export type Format = {
  id: FormatId;
  label: string;
  width: number;
  height: number;
  aspectRatio: string;
  description: string;
};

export const formats: readonly Format[] = [
  {
    id: 'vertical',
    label: 'Vertical',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    description: 'TikTok, Instagram Reels/Stories, YouTube Shorts',
  },
  {
    id: 'square',
    label: 'Square',
    width: 1080,
    height: 1080,
    aspectRatio: '1:1',
    description: 'Instagram feed, LinkedIn, Facebook posts',
  },
  {
    id: 'landscape',
    label: 'Landscape',
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    description: 'YouTube, Twitter/X, LinkedIn video, web embeds',
  },
  {
    id: 'portrait',
    label: 'Portrait',
    width: 1080,
    height: 1350,
    aspectRatio: '4:5',
    description: 'Instagram feed (tall crop), Pinterest',
  },
] as const;

/** Lookup by `FormatId`, typed so callers don't need null-checks. */
export const formatById = Object.fromEntries(
  formats.map((f) => [f.id, f])
) as Record<FormatId, Format>;
