/**
 * Sound-effects catalog. Each entry points to a file under `public/sfx/`. Drop
 * the audio assets there (see `public/sfx/README.md` for sourcing) and the file
 * paths below become resolvable via `staticFile()`.
 *
 * Use sparingly — over-SFX'd videos read as cheap. The strongest cues are:
 *   - whoosh on scene transitions with motion
 *   - pop on key callouts
 *   - subtle click in typewriter (every ~3 chars)
 *
 * Reference these constants instead of hardcoding paths, so changing assets is
 * one diff.
 */
export const sfx = {
  whoosh: 'sfx/whoosh.mp3',
  click: 'sfx/click.mp3',
  pop: 'sfx/pop.mp3',
  success: 'sfx/success.mp3',
  error: 'sfx/error.mp3',
} as const;

export type SfxKey = keyof typeof sfx;
