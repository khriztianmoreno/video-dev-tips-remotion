import React from 'react';
import { Audio, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import type { Hook } from '../../types/content';
import type { Theme } from '../../theme';
import type { LayoutMetrics } from '../../layout-metrics';
import { interFontFamily } from '../../fonts';
import { springs } from '../../motion';

interface HookSceneProps {
  hook: Hook;
  theme: Theme;
  metrics: LayoutMetrics;
}

const VERMILION = '#DD4A28';

export const HookScene: React.FC<HookSceneProps> = ({ hook, theme, metrics }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const audioSrc = hook.audioUrl
    ? hook.audioUrl.startsWith('http')
      ? hook.audioUrl
      : staticFile(hook.audioUrl)
    : null;

  const heroSpring = spring({ frame, fps, config: springs.punch });
  const subSpring = spring({ frame: frame - 10, fps, config: springs.enterSubtle });

  const variant = hook.variant ?? 'shock';
  const accent = variant === 'mistake' ? VERMILION : theme.primaryColor;

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
        alignItems: 'center',
        justifyContent: 'center',
        gap: metrics.contentGap,
        padding: metrics.safePaddingX,
        textAlign: 'center',
        fontFamily: interFontFamily,
        backgroundColor: theme.backgroundColor,
      }}
    >
      <div
        style={{
          opacity: heroSpring,
          transform: `scale(${0.7 + 0.3 * heroSpring})`,
          color: theme.textColor,
          fontSize: metrics.titleFontSize * 1.6,
          fontWeight: 900,
          letterSpacing: -2,
          lineHeight: 1.0,
          maxWidth: '92%',
        }}
      >
        {variant === 'mistake' && (
          <span style={{ color: accent, marginRight: 12 }}>×</span>
        )}
        <span>{hook.text}</span>
        {variant === 'question' && (
          <span style={{ color: accent, marginLeft: 8 }}>?</span>
        )}
      </div>
      {audioSrc && <Audio src={audioSrc} />}
      {hook.subtext && (
        <div
          style={{
            opacity: subSpring,
            color: accent,
            fontSize: metrics.narrationFontSize * 1.2,
            fontWeight: 700,
            letterSpacing: 0.5,
            maxWidth: '88%',
          }}
        >
          {hook.subtext}
        </div>
      )}
    </div>
  );
};
