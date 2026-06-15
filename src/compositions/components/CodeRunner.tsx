import React from 'react';
import { Highlight, themes, type Language } from 'prism-react-renderer';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import type { VideoStep } from '../../types/content';
import type { Theme } from '../../theme';
import type { LayoutMetrics } from '../../layout-metrics';
import { codeFontFamily, interFontFamily } from '../../fonts';

interface CodeRunnerProps {
  step: VideoStep;
  theme: Theme;
  metrics: LayoutMetrics;
}

const TITLE_FADE_IN_FRAMES = 12;
const TYPEWRITER_SECS = 1.5;
const NARRATION_DELAY_SECS = 0.4;
const NARRATION_FADE_IN_FRAMES = 15;

export const CodeRunner: React.FC<CodeRunnerProps> = ({ step, theme, metrics }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, TITLE_FADE_IN_FRAMES], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const titleTranslateY = interpolate(frame, [0, TITLE_FADE_IN_FRAMES], [16, 0], {
    extrapolateRight: 'clamp',
  });

  const code = step.codeSnippet ?? '';
  const typewriterFrames = TYPEWRITER_SECS * fps;
  const typewriterStart = TITLE_FADE_IN_FRAMES;
  const typewriterEnd = typewriterStart + typewriterFrames;
  const typewriterProgress = interpolate(
    frame,
    [typewriterStart, typewriterEnd],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const visibleChars = Math.floor(code.length * typewriterProgress);
  const visibleCode = code.slice(0, visibleChars);

  const cursorBlinkPhase = Math.floor((frame / fps) * 2) % 2;
  const showCursor = code.length > 0 && visibleChars < code.length;
  const cursor = showCursor || cursorBlinkPhase === 0 ? '▌' : ' ';

  const narrationStart = typewriterEnd + NARRATION_DELAY_SECS * fps;
  const narrationOpacity = interpolate(
    frame,
    [narrationStart, narrationStart + NARRATION_FADE_IN_FRAMES],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

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
            opacity: titleOpacity,
            transform: `translateY(${titleTranslateY}px)`,
          }}
        >
          {step.title}
        </div>
      )}
      {code && (
        <Highlight
          code={visibleCode + (showCursor ? cursor : '')}
          language={(step.language ?? 'javascript') as Language}
          theme={themes.vsDark}
        >
          {({ tokens, getLineProps, getTokenProps, style: themeStyle }) => (
            <pre
              style={{
                ...themeStyle,
                backgroundColor: theme.codeBackground,
                padding: metrics.codePadding,
                borderRadius: metrics.codeRadius,
                fontSize: metrics.codeFontSize,
                lineHeight: 1.45,
                fontFamily: codeFontFamily,
                margin: 0,
                overflow: 'hidden',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                border: `2px solid ${theme.brandColor}`,
              }}
            >
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      )}
      <div
        style={{
          fontSize: metrics.narrationFontSize,
          lineHeight: 1.4,
          color: theme.textColor,
          opacity: narrationOpacity,
        }}
      >
        {step.narrationText}
      </div>
    </div>
  );
};
