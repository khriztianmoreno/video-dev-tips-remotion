import React from 'react';
import { Highlight, themes, type Language } from 'prism-react-renderer';
import {
  Audio,
  Img,
  OffthreadVideo,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
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
const IMAGE_FADE_IN_FRAMES = 18;

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

  const resolveSrc = (src: string) =>
    src.startsWith('http') ? src : staticFile(src);
  const imageSrc = step.imageUrl ? resolveSrc(step.imageUrl) : null;
  const videoSrc = step.videoUrl ? resolveSrc(step.videoUrl) : null;
  const audioSrc = step.audioUrl ? resolveSrc(step.audioUrl) : null;
  const mediaOpacity = interpolate(
    frame,
    [TITLE_FADE_IN_FRAMES / 2, TITLE_FADE_IN_FRAMES / 2 + IMAGE_FADE_IN_FRAMES],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Ken Burns drift + optional region focus so small UI detail reads on mobile.
  const sceneFrames = step.durationInSeconds * fps;
  const kenBurns = interpolate(frame, [0, sceneFrames], [1, 1.06], {
    extrapolateRight: 'clamp',
  });
  const imageScale = (step.imageFocus?.scale ?? 1) * kenBurns;
  const focusX = (step.imageFocus?.x ?? 0.5) * 100;
  const focusY = (step.imageFocus?.y ?? 0.5) * 100;

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
      {(videoSrc || imageSrc) && (
        <div
          style={{
            flex: '1 1 auto',
            minHeight: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: mediaOpacity,
          }}
        >
          <div
            style={{
              display: 'flex',
              maxWidth: '100%',
              maxHeight: '100%',
              overflow: 'hidden',
              borderRadius: metrics.codeRadius,
              border: `2px solid ${theme.brandColor}`,
            }}
          >
            {videoSrc ? (
              <OffthreadVideo
                src={videoSrc}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            ) : (
              <Img
                src={imageSrc as string}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  transform: `scale(${imageScale})`,
                  transformOrigin: `${focusX}% ${focusY}%`,
                }}
              />
            )}
          </div>
        </div>
      )}
      {audioSrc && <Audio src={audioSrc} />}
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
