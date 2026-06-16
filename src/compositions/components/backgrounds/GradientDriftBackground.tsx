import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import type { Theme } from '../../../theme';

interface Props {
  theme: Theme;
}

/**
 * Two radial gradient blobs slowly drifting in opposite directions. Cheap and reads as
 * "alive" without distracting from foreground content. The hex appendices (`26`, `1f`)
 * are alpha bytes — ~15% and ~12% opacity.
 */
export const GradientDriftBackground: React.FC<Props> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const x1 = 50 + Math.sin(t * 0.28) * 32;
  const y1 = 35 + Math.cos(t * 0.36) * 22;
  const x2 = 50 - Math.sin(t * 0.22) * 36;
  const y2 = 70 - Math.cos(t * 0.31) * 26;

  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(circle at ${x1}% ${y1}%, ${theme.brandColor}26, transparent 55%),
          radial-gradient(circle at ${x2}% ${y2}%, ${theme.primaryColor}1f, transparent 60%),
          ${theme.backgroundColor}
        `,
      }}
    />
  );
};
