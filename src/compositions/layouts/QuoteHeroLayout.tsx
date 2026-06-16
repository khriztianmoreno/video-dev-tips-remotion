import React from 'react';
import {
  Audio,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type { VideoStep } from '../../types/content';
import type { Theme } from '../../theme';
import type { LayoutMetrics } from '../../layout-metrics';
import { interFontFamily } from '../../fonts';
import { springs } from '../../motion';

interface QuoteHeroLayoutProps {
  step: VideoStep;
  theme: Theme;
  metrics: LayoutMetrics;
}

export const QuoteHeroLayout: React.FC<QuoteHeroLayoutProps> = ({
  step,
  theme,
  metrics,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const heroSpring = spring({ frame, fps, config: springs.punch });
  const attributionSpring = spring({
    frame: frame - 18,
    fps,
    config: springs.enterSubtle,
  });

  // Subtle breathing once the hero has landed.
  const settled = heroSpring > 0.98 ? 1 : 0;
  const breathing = Math.sin((frame / fps - 1) * 2) * 0.005 * settled;
  const scale = 0.85 + 0.15 * heroSpring + breathing;

  const resolveSrc = (src: string) =>
    src.startsWith('http') ? src : staticFile(src);
  const audioSrc = step.audioUrl ? resolveSrc(step.audioUrl) : null;

  const hero = step.quote ?? step.narrationText;
  const attribution = step.quoteAttribution;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: metrics.safePaddingX,
        textAlign: 'center',
        fontFamily: interFontFamily,
      }}
    >
      {audioSrc && <Audio src={audioSrc} />}
      <div
        style={{
          opacity: heroSpring,
          transform: `scale(${scale})`,
          color: theme.textColor,
          fontSize: metrics.titleFontSize * 1.4,
          fontWeight: 800,
          letterSpacing: -1.5,
          lineHeight: 1.05,
          maxWidth: '92%',
        }}
      >
        <span style={{ color: theme.primaryColor }}>&ldquo;</span>
        {hero}
        <span style={{ color: theme.primaryColor }}>&rdquo;</span>
      </div>
      {attribution && (
        <div
          style={{
            opacity: attributionSpring,
            color: theme.mutedTextColor,
            fontSize: metrics.narrationFontSize,
            fontWeight: 500,
            marginTop: metrics.contentGap,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        >
          — {attribution}
        </div>
      )}
    </div>
  );
};
