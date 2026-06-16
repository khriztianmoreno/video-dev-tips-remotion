import React from 'react';
import { Highlight, themes, type Language } from 'prism-react-renderer';
import {
  Audio,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type { VideoStep } from '../../types/content';
import type { Theme } from '../../theme';
import type { LayoutMetrics } from '../../layout-metrics';
import { codeFontFamily, interFontFamily } from '../../fonts';
import { outExpo, springs } from '../../motion';
import { AnimatedBorderFrame } from '../components/AnimatedBorderFrame';

interface CodeDiffLayoutProps {
  step: VideoStep;
  theme: Theme;
  metrics: LayoutMetrics;
}

/**
 * Before/after layout. The "before" panel enters first, the arrow draws between, then
 * the "after" panel springs in. On landscape canvases the panels sit side-by-side; on
 * vertical/square/portrait they stack with the arrow rotated 90°. Falls back to
 * `step.codeSnippet` for either side if `codeBefore`/`codeAfter` is missing.
 */
export const CodeDiffLayout: React.FC<CodeDiffLayoutProps> = ({
  step,
  theme,
  metrics,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isLandscape = width / height > 1.3;

  const before = step.codeBefore ?? step.codeSnippet ?? '';
  const after = step.codeAfter ?? '';
  const language = (step.language ?? 'javascript') as Language;

  const titleSpring = spring({ frame, fps, config: springs.enter });
  const beforeSpring = spring({ frame: frame - 6, fps, config: springs.enterSubtle });
  const arrowProgress = interpolate(
    frame,
    [0.8 * fps, 1.4 * fps],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: outExpo }
  );
  const afterSpring = spring({
    frame: frame - 1.4 * fps,
    fps,
    config: springs.enter,
  });
  const narrationSpring = spring({
    frame: frame - 2.0 * fps,
    fps,
    config: springs.enterSubtle,
  });

  const resolveSrc = (src: string) =>
    src.startsWith('http') ? src : staticFile(src);
  const audioSrc = step.audioUrl ? resolveSrc(step.audioUrl) : null;

  const renderPanel = (code: string, opacity: number, accent: string) => (
    <Highlight code={code} language={language} theme={themes.vsDark}>
      {({ tokens, getLineProps, getTokenProps, style: themeStyle }) => (
        <AnimatedBorderFrame
          colors={[accent]}
          borderRadius={metrics.codeRadius}
          outerStyle={{ opacity, flex: '1 1 0', minHeight: 0, minWidth: 0 }}
        >
          <pre
            style={{
              ...themeStyle,
              backgroundColor: theme.codeBackground,
              padding: metrics.codePadding,
              fontSize: metrics.codeFontSize * 0.95,
              lineHeight: 1.45,
              fontFamily: codeFontFamily,
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              flex: '1 1 auto',
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
        </AnimatedBorderFrame>
      )}
    </Highlight>
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
            opacity: titleSpring,
            transform: `translateY(${(1 - titleSpring) * 16}px)`,
          }}
        >
          {step.title}
        </div>
      )}
      {audioSrc && <Audio src={audioSrc} />}
      <div
        style={{
          flex: '1 1 auto',
          minHeight: 0,
          display: 'flex',
          flexDirection: isLandscape ? 'row' : 'column',
          alignItems: 'stretch',
          gap: metrics.contentGap,
        }}
      >
        {renderPanel(before, beforeSpring, '#DD4A28')}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.primaryColor,
            fontSize: metrics.titleFontSize,
            fontWeight: 800,
            transform: isLandscape ? 'none' : 'rotate(90deg)',
            opacity: arrowProgress,
            flexShrink: 0,
          }}
        >
          →
        </div>
        {renderPanel(after, afterSpring, theme.primaryColor)}
      </div>
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
