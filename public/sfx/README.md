# SFX assets

Sound effects referenced from `src/sfx.ts`. These files are **not** committed —
drop your own here. The render will simply not play missing SFX (no error if a
`<Audio>` referencing one is not mounted).

## Expected files

| File          | Used for                      | Suggested length |
| ------------- | ----------------------------- | ---------------- |
| `whoosh.mp3`  | Scene transitions with motion | 0.4 – 0.8 s      |
| `click.mp3`   | Typewriter cadence (optional) | < 0.1 s          |
| `pop.mp3`     | Code callouts, emphasis       | 0.2 – 0.4 s      |
| `success.mp3` | Positive takeaways            | 0.5 – 1.0 s      |
| `error.mp3`   | "Don't do this" beats         | 0.5 – 1.0 s      |

## Free sources

- [Mixkit free SFX](https://mixkit.co/free-sound-effects/) — high-quality, royalty-free, attribution optional
- [Zapsplat](https://www.zapsplat.com/) — large library, free with account
- [Freesound](https://freesound.org/) — community, Creative Commons (check per-file license)

## Volume guidance

When you mount `<Audio>` for SFX, keep the volume around `0.4 – 0.6`. The
background music sits at `0.07`; SFX should sit above that but never overpower
narration.
