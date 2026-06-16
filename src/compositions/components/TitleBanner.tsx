import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { Theme } from '../../theme';
import type { LayoutMetrics } from '../../layout-metrics';
import { interFontFamily } from '../../fonts';
import { springs } from '../../motion';

interface TitleBannerProps {
  title: string;
  theme: Theme;
  metrics: LayoutMetrics;
}

export const TitleBanner: React.FC<TitleBannerProps> = ({ title, theme, metrics }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: springs.enter });
  const translateY = (1 - enter) * -24;

  return (
    <div
      style={{
        position: 'absolute',
        top: metrics.titleTop,
        left: metrics.safePaddingX,
        right: metrics.safePaddingX,
        textAlign: 'center',
        fontFamily: interFontFamily,
        opacity: enter,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <span
        style={{
          display: 'inline-block',
          backgroundColor: theme.brandColor,
          color: theme.textColor,
          padding: `${metrics.titlePadY}px ${metrics.titlePadX}px`,
          borderRadius: metrics.titleRadius,
          fontSize: metrics.titleFontSize,
          fontWeight: 800,
          letterSpacing: -1,
          lineHeight: 1.15,
        }}
      >
        <span style={{ color: theme.primaryColor }}>{'{ '}</span>
        {title}
        <span style={{ color: theme.primaryColor }}>{' };'}</span>
      </span>
    </div>
  );
};
