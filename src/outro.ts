import type { VideoStep } from './types/content';

/**
 * Brand outro appended automatically as the LAST scene of every video. It renders
 * with its own component (`OutroScene`) — NOT the regular `CodeRunner` — so it has
 * no title banner, no footer, a borderless central image, and the message below it.
 * Single source of truth: edit the handle / image / heart / copy / duration here.
 */
export const SOCIAL_HANDLE = '@khriztianmoreno';

/** Central image (the brand insignia / speech-bubble badge). Rendered without border. */
export const OUTRO_IMAGE_URL =
  'https://res.cloudinary.com/khriztianmoreno/image/upload/v1622908244/km_site/insignia.png';

/** Heart graphic shown next to the follow line (public/-relative path or http(s) URL). */
export const HEART_IMAGE_URL = 'brand/love.png';

/**
 * Looping background video for the outro scene (path relative to `public/`).
 * Plays muted, fitted with `object-fit: cover`, at reduced opacity so the brand
 * insignia and CTA remain readable on top. Swap this constant to change the loop.
 */
export const OUTRO_BG_VIDEO = 'brand/outro-loop.mp4';

/** Opacity of the background loop (0–1). Lower = quieter motion, higher = more present. */
export const OUTRO_BG_VIDEO_OPACITY = 0.85;

/**
 * Open question shown on the outro to spark comments. A topic can override it with
 * `ctaQuestion` in its `TopicMetadata`; otherwise this generic one is used.
 */
export const DEFAULT_OUTRO_QUESTION =
  '¿Tú cómo lo resuelves? Cuéntame en los comentarios';

/** Small follow label under the question. */
export const FOLLOW_LABEL = `Sígueme en ${SOCIAL_HANDLE}`;

export const outroStep: VideoStep = {
  id: 'outro-follow',
  durationInSeconds: 6,
  imageUrl: OUTRO_IMAGE_URL,
  narrationText: DEFAULT_OUTRO_QUESTION,
};

/** Returns the topic timeline with the brand outro appended (used for duration sums). */
export const withOutro = (timeline: VideoStep[]): VideoStep[] => [
  ...timeline,
  outroStep,
];
