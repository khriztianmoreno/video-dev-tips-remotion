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

/** Heart graphic shown next to the message (public/-relative path or http(s) URL). */
export const HEART_IMAGE_URL = 'brand/love.png';

/** Message shown below the central image. */
export const OUTRO_MESSAGE = 'Sígueme para más tips';

export const outroStep: VideoStep = {
  id: 'outro-follow',
  durationInSeconds: 6,
  imageUrl: OUTRO_IMAGE_URL,
  narrationText: OUTRO_MESSAGE,
};

/** Returns the topic timeline with the brand outro appended (used for duration sums). */
export const withOutro = (timeline: VideoStep[]): VideoStep[] => [
  ...timeline,
  outroStep,
];
