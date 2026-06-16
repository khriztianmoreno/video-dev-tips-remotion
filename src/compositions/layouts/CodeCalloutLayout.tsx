import React from 'react';
import { Highlight, themes, type Language } from 'prism-react-renderer';
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

interface CodeCalloutLayoutProps {
  step: VideoStep;
  theme: Theme;
  metrics: LayoutMetrics;
}

// Highlight kicks in ~0.8s into the scene so viewers read the full code first.
const HIGHLIGHT_DELAY_SECS = 0.8;
const NARRATION_DELAY_SECS = 1.2;

export const CodeCalloutLayout: React.FC<CodeCalloutLayoutProps> = ({
  step,
  theme,
  metrics,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: springs.enter });
  const codeSpring = spring({
    frame: frame - 6,
    fps,
    config: springs.enterSubtle,
  });
  const highlightSpring = spring({
    frame: frame - HIGHLIGHT_DELAY_SECS * fps,
    fps,
    config: springs.punch,
  });
  const narrationSpring = spring({
    frame: frame - NARRATION_DELAY_SECS * fps,
    fps,
    config: springs.enterSubtle,
  });

  const resolveSrc = (src: string) =>
    src.startsWith('http') ? src : staticFile(src);
  const audioSrc = step.audioUrl ? resolveSrc(step.audioUrl) : null;

  const code = step.codeSnippet ?? '';
  const callout = step.calloutToken;

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
      {code && (
        <div style={{ opacity: codeSpring }}>
          <Highlight
            code={code}
            language={(step.language ?? 'javascript') as Language}
            theme={themes.vsDark}
          >
            {({ tokens, getLineProps, getTokenProps, style: themeStyle }) => (
              <AnimatedBorderFrame
                colors={defaultBorderPalette(theme)}
                borderRadius={metrics.codeRadius}
              >
                <pre
                  style={{
                    ...themeStyle,
                    backgroundColor: theme.codeBackground,
                    padding: metrics.codePadding,
                    fontSize: metrics.codeFontSize,
                    lineHeight: 1.55,
                    fontFamily: codeFontFamily,
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    flex: '1 1 auto',
                  }}
                >
                  {tokens.map((line, i) => (
                    <div key={i} {...getLineProps({ line })}>
                      {line.map((token, key) => {
                        const tokenProps = getTokenProps({ token });
                        const isCallout =
                          !!callout && token.content.includes(callout);
                        return (
                          <span
                            key={key}
                            {...tokenProps}
                            style={{
                              ...tokenProps.style,
                              display: 'inline-block',
                              ...(isCallout && highlightSpring > 0
                                ? {
                                    backgroundColor: `rgba(0, 246, 187, ${0.18 * highlightSpring})`,
                                    boxShadow: `0 0 ${24 * highlightSpring}px rgba(0, 246, 187, ${0.5 * highlightSpring})`,
                                    borderRadius: 6,
                                    padding: '2px 6px',
                                    transform: `scale(${1 + 0.08 * highlightSpring})`,
                                    color: theme.primaryColor,
                                    fontWeight: 700,
                                  }
                                : {}),
                            }}
                          />
                        );
                      })}
                    </div>
                  ))}
                </pre>
              </AnimatedBorderFrame>
            )}
          </Highlight>
        </div>
      )}
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
