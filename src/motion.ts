import { Easing } from 'remotion';
import type { TransitionPresentation } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { wipe } from '@remotion/transitions/wipe';
import { flip } from '@remotion/transitions/flip';
import { diagonalStinger } from './transitions/diagonal-stinger';
import type { StepTransition } from './types/content';
import type { Theme } from './theme';

/**
 * Canonical spring configs. Always prefer these over ad-hoc damping/mass numbers
 * so the whole video has a coherent motion language.
 *
 * - `enter`: default entry for content (title, code, narration). Mild overshoot.
 * - `enterSubtle`: critical-path entries that should not steal attention.
 * - `punch`: hooks, hot-takes, takeaways. Loud overshoot, lands fast.
 * - `settle`: idle micro-motion / breathing.
 */
export const springs = {
  enter: { damping: 14, mass: 0.6, stiffness: 100 },
  enterSubtle: { damping: 20, mass: 0.8, stiffness: 120 },
  punch: { damping: 8, mass: 0.4, stiffness: 200 },
  settle: { damping: 30, mass: 1, stiffness: 80 },
} as const;

/** Out-expo bezier — the default easing for any continuous `interpolate`. */
export const outExpo = Easing.bezier(0.22, 1, 0.36, 1);

/** Overlap between adjacent content scenes, in frames (long enough to read a stinger). */
export const TRANSITION_FRAMES = 20;

type AnyPresentation = TransitionPresentation<Record<string, unknown>>;

/**
 * Resolve a `StepTransition` string into a Remotion `TransitionPresentation`.
 * Falls back to `fade` for unknown values. The cast to `AnyPresentation` is
 * needed because each presentation factory returns a distinct generic instance
 * (SlideProps/WipeProps/...); we widen at this boundary so a single helper
 * can serve all switch arms.
 */
export const resolveTransition = (
  kind: StepTransition | undefined,
  theme?: Theme
): AnyPresentation => {
  switch (kind) {
    case 'slide-left':
      return slide({ direction: 'from-right' }) as AnyPresentation;
    case 'wipe':
      return wipe() as AnyPresentation;
    case 'flip':
      return flip() as AnyPresentation;
    case 'stinger':
      return diagonalStinger(theme) as unknown as AnyPresentation;
    case 'fade':
    default:
      return fade() as AnyPresentation;
  }
};
