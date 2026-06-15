import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import type { Theme } from '../../theme';
import type { LayoutMetrics } from '../../layout-metrics';
import { interFontFamily } from '../../fonts';

interface TitleBannerProps {
  title: string;
  theme: Theme;
  metrics: LayoutMetrics;
}

const FADE_IN_FRAMES = 20;

export const TitleBanner: React.FC<TitleBannerProps> = ({ title, theme, metrics }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, FADE_IN_FRAMES], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const translateY = interpolate(frame, [0, FADE_IN_FRAMES], [-24, 0], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: metrics.titleTop,
        left: metrics.safePaddingX,
        right: metrics.safePaddingX,
        textAlign: 'center',
        fontFamily: interFontFamily,
        opacity,
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
