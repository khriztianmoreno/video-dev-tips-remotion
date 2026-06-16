import { musicManifest } from './_generated/music-manifest';
import { topicKey } from './music';

/**
 * Returns the `public/`-relative music file for a topic, or null if none was fetched.
 * Used by the render to give per-topic music precedence over the global track.
 */
export const getTopicMusicFile = (
  category: string,
  id: string,
  version: string
): string | null => {
  const entry = musicManifest[topicKey(category, id, version)];
  return entry?.file ?? null;
};
