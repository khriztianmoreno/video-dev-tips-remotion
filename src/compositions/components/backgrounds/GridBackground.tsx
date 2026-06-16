import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import type { Theme } from '../../../theme';

interface Props {
  theme: Theme;
}

const GRID_SIZE = 60;
const SCROLL_PX_PER_SEC = 18;

/**
 * Subtle scrolling grid. The grid uses the brand color at very low alpha so it reads
 * as architecture, not foreground. Scrolls vertically slow enough not to compete with
 * the title/code, fast enough to register as motion.
 */
export const GridBackground: React.FC<Props> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const offset = ((frame / fps) * SCROLL_PX_PER_SEC) % GRID_SIZE;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.backgroundColor,
        backgroundImage: `
          linear-gradient(${theme.brandColor}22 1px, transparent 1px),
          linear-gradient(90deg, ${theme.brandColor}22 1px, transparent 1px)
        `,
        backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
        backgroundPosition: `0px ${offset}px, 0px ${offset}px`,
      }}
    />
  );
};
