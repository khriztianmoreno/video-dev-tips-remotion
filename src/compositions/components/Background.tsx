import React from 'react';
import type { Theme } from '../../theme';
import type { BackgroundKind } from '../../backgrounds';
import { DEFAULT_BACKGROUND } from '../../backgrounds';
import { SolidBackground } from './backgrounds/SolidBackground';
import { GradientDriftBackground } from './backgrounds/GradientDriftBackground';
import { NoiseBackground } from './backgrounds/NoiseBackground';
import { GridBackground } from './backgrounds/GridBackground';
import { ParticlesBackground } from './backgrounds/ParticlesBackground';

interface BackgroundProps {
  kind?: BackgroundKind;
  theme: Theme;
}

/**
 * Dispatcher for the bottom-of-z-stack atmospheric layer. Mounted once at the root
 * of `ShortVideoLayout`; hook and outro scenes paint their own opaque backgrounds
 * on top, so the variant only reads during the content scenes.
 */
export const Background: React.FC<BackgroundProps> = ({ kind, theme }) => {
  switch (kind ?? DEFAULT_BACKGROUND) {
    case 'solid':
      return <SolidBackground theme={theme} />;
    case 'noise':
      return <NoiseBackground theme={theme} />;
    case 'grid':
      return <GridBackground theme={theme} />;
    case 'particles':
      return <ParticlesBackground theme={theme} />;
    case 'gradient-drift':
    default:
      return <GradientDriftBackground theme={theme} />;
  }
};
