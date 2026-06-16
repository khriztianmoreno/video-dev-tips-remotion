import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import type { Theme } from '../../theme';

// Brand accent used alongside the theme's purple/green for the border comets.
const ACCENT_ORANGE = '#FF7A3D';

/** Purple (brand) + green (primary) + orange — the comets rotating around a box. */
export const defaultBorderPalette = (theme: Theme): string[] => [
  theme.brandColor,
  theme.primaryColor,
  ACCENT_ORANGE,
];

interface AnimatedBorderFrameProps {
  /** Hex colors for the comets, evenly spaced around the ring (e.g. one per color). */
  colors: string[];
  /** Outer corner radius; the inner content gets `borderRadius - borderWidth`. */
  borderRadius: number;
  borderWidth?: number;
  /** Seconds for one full lap around the box. */
  speedSeconds?: number;
  /** Angular width of each bright comet segment, in degrees. */
  cometDeg?: number;
  /** Styles for the outer ring (sizing/flex/opacity — replaces the old `border`/`borderRadius`). */
  outerStyle?: React.CSSProperties;
  /** Styles for the inner content box (background, padding, font, etc.). */
  innerStyle?: React.CSSProperties;
  children: React.ReactNode;
}

/**
 * Wraps content in a frame whose border is a conic-gradient: one chunky comet per
 * color continuously orbits the box (evenly spaced), each fading into its own dim
 * resting tone in between. Box-model-neutral (padding == old border width) so callers
 * just move their existing `border`/`borderRadius` styles into `outerStyle`/`innerStyle`.
 */
export const AnimatedBorderFrame: React.FC<AnimatedBorderFrameProps> = ({
  colors,
  borderRadius,
  borderWidth = 3,
  speedSeconds = 3.5,
  cometDeg = 50,
  outerStyle,
  innerStyle,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const angle = ((frame / fps) / speedSeconds) * 360;

  const n = colors.length;
  const slice = 360 / n;
  const half = cometDeg / 2;
  const plateau = half * 0.3; // flat saturated peak — reads as a thicker blip, not a thin point
  const dim = (c: string) => `${c}33`;

  const stops: string[] = [];
  for (let i = 0; i < n; i++) {
    const center = half + i * slice;
    const c = colors[i] as string;
    const d = dim(c);
    stops.push(`${d} ${(center - half).toFixed(2)}deg`);
    stops.push(`${c} ${(center - plateau).toFixed(2)}deg`);
    stops.push(`${c} ${(center + plateau).toFixed(2)}deg`);
    stops.push(`${d} ${(center + half).toFixed(2)}deg`);
  }
  stops.push(`${dim(colors[0] as string)} 360deg`);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius,
        padding: borderWidth,
        background: `conic-gradient(from ${angle}deg, ${stops.join(', ')})`,
        ...outerStyle,
      }}
    >
      <div
        style={{
          flex: '1 1 auto',
          minWidth: 0,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: Math.max(0, borderRadius - borderWidth),
          ...innerStyle,
        }}
      >
        {children}
      </div>
    </div>
  );
};
