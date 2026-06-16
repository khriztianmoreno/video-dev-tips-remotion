import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { Theme } from '../../../theme';

interface Props {
  theme: Theme;
}

/**
 * Static perlin-style noise via SVG `<feTurbulence>` (GPU-accelerated by Chromium).
 * No frame dependency — the texture is fixed; reads as "film grain" rather than
 * shifting noise. Cheaper than animating a per-pixel canvas.
 */
export const NoiseBackground: React.FC<Props> = ({ theme }) => (
  <AbsoluteFill style={{ backgroundColor: theme.backgroundColor }}>
    <svg
      width="100%"
      height="100%"
      style={{ position: 'absolute', inset: 0, opacity: 0.08, mixBlendMode: 'overlay' }}
    >
      <defs>
        <filter id="noise-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            stitchTiles="stitch"
          />
        </filter>
      </defs>
      <rect width="100%" height="100%" filter="url(#noise-filter)" />
    </svg>
  </AbsoluteFill>
);
