/**
 * Optional background music applied to every video (helps these index better on
 * TikTok/Reels). Drop a track in `public/` (e.g. `public/audio/lofi.mp3`) and set
 * `src` to its path (or an `http(s)` URL); keep the volume low (5–8%). Leave `src`
 * as `null` to render without music.
 */
export const backgroundMusic: { src: string | null; volume: number } = {
  src: null,
  volume: 0.07,
};
