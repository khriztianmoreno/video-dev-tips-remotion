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
import { codeFontFamily, interFontFamily } from '../../fonts';
import { springs } from '../../motion';
import { AnimatedBorderFrame, defaultBorderPalette } from '../components/AnimatedBorderFrame';

interface TerminalLayoutProps {
  step: VideoStep;
  theme: Theme;
  metrics: LayoutMetrics;
}

// Lines reveal at this cadence (lines per second).
const REVEAL_RATE = 1.6;

const TERMINAL_BG = '#0a0a0f';
const TERMINAL_TEXT = '#e6e6e6';
const TERMINAL_PROMPT = '#00F6BB';

export const TerminalLayout: React.FC<TerminalLayoutProps> = ({
  step,
  theme,
  metrics,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: springs.enter });
  const panelSpring = spring({ frame: frame - 6, fps, config: springs.enterSubtle });
  const narrationSpring = spring({
    frame: frame - 1.2 * fps,
    fps,
    config: springs.enterSubtle,
  });

  const resolveSrc = (src: string) =>
    src.startsWith('http') ? src : staticFile(src);
  const audioSrc = step.audioUrl ? resolveSrc(step.audioUrl) : null;

  const lines = step.terminalLines ?? [];
  const elapsed = Math.max(0, frame - 12) / fps;
  const visibleCount = Math.min(lines.length, Math.floor(elapsed * REVEAL_RATE) + 1);
  const visibleLines = lines.slice(0, visibleCount);
  const cursorBlink = Math.floor((frame / fps) * 2) % 2 === 0;

  return (
    <div
      style={{
        position: 'absolute',
        top: metrics.contentTop,
        left: metrics.safePaddingX,
        right: metrics.safePaddingX,
        bottom: metrics.contentBottom,
        display: 'flex',
        flexDirection: 'column',
        gap: metrics.contentGap,
        fontFamily: interFontFamily,
      }}
    >
      {step.title && (
        <div
          style={{
            color: theme.primaryColor,
            fontSize: metrics.stepTitleFontSize,
            fontWeight: 700,
            opacity: titleSpring,
            transform: `translateY(${(1 - titleSpring) * 16}px)`,
          }}
        >
          {step.title}
        </div>
      )}
      {audioSrc && <Audio src={audioSrc} />}
      <AnimatedBorderFrame
        colors={defaultBorderPalette(theme)}
        borderRadius={metrics.codeRadius}
        outerStyle={{ flex: '1 1 auto', minHeight: 0, opacity: panelSpring }}
        innerStyle={{
          backgroundColor: TERMINAL_BG,
          padding: metrics.codePadding,
          fontFamily: codeFontFamily,
          fontSize: metrics.codeFontSize * 0.9,
          color: TERMINAL_TEXT,
          gap: 8,
        }}
      >
        {visibleLines.map((line, i) => {
          const isLast = i === visibleLines.length - 1;
          return (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
              <span style={{ color: TERMINAL_PROMPT, fontWeight: 700 }}>
                {line.prompt ?? (line.output.startsWith('//') ? '#' : '$')}
              </span>
              <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {line.output}
                {isLast && cursorBlink && (
                  <span style={{ color: TERMINAL_PROMPT }}> ▌</span>
                )}
              </span>
            </div>
          );
        })}
      </AnimatedBorderFrame>
      <div
        style={{
          fontSize: metrics.narrationFontSize,
          lineHeight: 1.4,
          color: theme.textColor,
          opacity: narrationSpring,
        }}
      >
        {step.narrationText}
      </div>
    </div>
  );
};
