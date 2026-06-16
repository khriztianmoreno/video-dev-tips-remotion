import React from 'react';
import { AbsoluteFill, interpolate, useVideoConfig } from 'remotion';
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from '@remotion/transitions';
import type { Theme } from '../theme';
import { defaultTheme } from '../theme';

const ACCENT_WHITE = '#ffffff';
const ACCENT_ORANGE = '#FF7A3D';

type StingerProps = { purple: string; edge: string };

// Each capsule: [along, perp, lenFactor, thickFactor, alpha] in units of the diagonal.
// `along` staggers it forward/back on the diagonal → capsules enter at DIFFERENT times.
const MAIN_CAPS: [number, number, number, number, number][] = [
  [0.34, -0.46, 1.6, 0.17, 0.9],
  [0.06, -0.26, 2.2, 0.19, 0.96],
  [-0.22, -0.04, 2.0, 0.18, 0.88],
  [0.16, 0.18, 2.4, 0.2, 0.96],
  [-0.36, 0.38, 1.5, 0.17, 0.9],
  [-0.06, 0.56, 1.8, 0.18, 0.93],
  [0.24, 0.04, 1.3, 0.12, 0.85],
];

// Accents: [along, perp, lenFactor, thickPx, colorKey]
const ACCENTS: [number, number, number, number, 'edge' | 'white' | 'orange'][] = [
  [0.46, -0.5, 0.52, 6, 'edge'],
  [0.12, 0.1, 0.46, 5, 'white'],
  [-0.3, -0.3, 0.4, 5, 'orange'],
  [0.28, 0.46, 0.34, 4, 'edge'],
  [-0.12, 0.3, 0.3, 4, 'white'],
];

/**
 * A scattered cluster of translucent purple diagonal capsules (rounded ends, staggered
 * along the diagonal so each enters at a different time) plus accent streaks, over a
 * transparent container. Wipes in to (near) cover, then dissolves out.
 */
const StingerOverlay: React.FC<{ progress: number; props: StingerProps }> = ({
  progress,
  props,
}) => {
  const { width, height } = useVideoConfig();
  const diag = Math.hypot(width, height);

  const inPhase = progress < 0.5;
  const s = inPhase
    ? -1 + Math.pow(progress / 0.5, 0.72)
    : ((progress - 0.5) / 0.5) * 0.5;
  const travel = diag * 1.4;
  const tx = s * travel * 0.707;
  const ty = -s * travel * 0.707;
  const opacity = inPhase
    ? 1
    : interpolate(progress, [0.6, 0.95], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });

  const accentColor = { edge: props.edge, white: ACCENT_WHITE, orange: ACCENT_ORANGE };

  // Capsule with its own along/perp offset on top of the global sweep.
  const cap = (
    lenPx: number,
    along: number,
    perp: number,
    thickPx: number,
    bg: string,
    extra: React.CSSProperties = {}
  ): React.CSSProperties => {
    const dx = (along + perp) * diag * 0.707;
    const dy = (-along + perp) * diag * 0.707;
    return {
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: lenPx,
      height: thickPx,
      borderRadius: thickPx / 2,
      background: bg,
      transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) rotate(-45deg)`,
      transformOrigin: 'center',
      ...extra,
    };
  };

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity }}>
      <div style={{ position: 'absolute', inset: 0, transform: `translate(${tx}px, ${ty}px)` }}>
        {MAIN_CAPS.map(([along, perp, lf, tf, a], i) => (
          <div
            key={`p${i}`}
            style={cap(lf * diag, along, perp, tf * diag, props.purple, { opacity: a })}
          />
        ))}
        {ACCENTS.map(([along, perp, lf, th, key], i) => (
          <div
            key={`a${i}`}
            style={cap(lf * diag, along, perp, th, accentColor[key], {
              opacity: 0.9,
              boxShadow: `0 0 16px ${accentColor[key]}aa`,
            })}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const StingerComponent: React.FC<
  TransitionPresentationComponentProps<StingerProps>
> = ({ children, presentationDirection, presentationProgress, passedProps }) => {
  const isEntering = presentationDirection === 'entering';
  const childVisible = isEntering
    ? presentationProgress >= 0.5
    : presentationProgress < 0.5;
  // Only during the actual transition window. @remotion/transitions keeps the presentation
  // mounted for the whole scene with progress pinned at 0 (before) / 1 (after); without the
  // strict bounds the overlay capsules poke into the static scene.
  const showOverlay = isEntering
    ? presentationProgress >= 0.5 && presentationProgress < 1
    : presentationProgress > 0 && presentationProgress < 0.5;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: childVisible ? 1 : 0 }}>{children}</AbsoluteFill>
      {showOverlay && (
        <StingerOverlay progress={presentationProgress} props={passedProps} />
      )}
    </AbsoluteFill>
  );
};

export const diagonalStinger = (
  theme: Theme = defaultTheme
): TransitionPresentation<StingerProps> => ({
  component: StingerComponent,
  props: { purple: theme.brandColor, edge: theme.primaryColor },
});
