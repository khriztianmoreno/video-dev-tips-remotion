import React from 'react';
import { Img, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { LayoutMetrics } from '../../layout-metrics';
import { BRAND_LOGO_URL } from '../../theme';
import { springs } from '../../motion';

const TARGET_OPACITY = 0.95;

interface BrandFooterProps {
  metrics: LayoutMetrics;
}

export const BrandFooter: React.FC<BrandFooterProps> = ({ metrics }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: springs.enterSubtle });

  return (
    <div
      style={{
        position: 'absolute',
        bottom: metrics.footerOffset,
        right: metrics.footerOffset,
        opacity: enter * TARGET_OPACITY,
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
