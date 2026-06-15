import React from 'react';
import { Img, interpolate, useCurrentFrame } from 'remotion';
import type { LayoutMetrics } from '../../layout-metrics';
import { BRAND_LOGO_URL } from '../../theme';

const FADE_IN_FRAMES = 24;
const TARGET_OPACITY = 0.95;

interface BrandFooterProps {
  metrics: LayoutMetrics;
}

export const BrandFooter: React.FC<BrandFooterProps> = ({ metrics }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, FADE_IN_FRAMES], [0, TARGET_OPACITY], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        bottom: metrics.footerOffset,
        right: metrics.footerOffset,
        opacity,
      }}
    >
      <Img
        src={BRAND_LOGO_URL}
        style={{
          width: metrics.footerWidth,
          height: 'auto',
          display: 'block',
        }}
      />
    </div>
  );
};
