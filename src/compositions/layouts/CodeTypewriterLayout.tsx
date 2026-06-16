import React from "react";
import { Highlight, themes, type Language } from "prism-react-renderer";
import {
  Audio,
  Img,
  OffthreadVideo,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { VideoStep } from "../../types/content";
import type { Theme } from "../../theme";
import type { LayoutMetrics } from "../../layout-metrics";
import { codeFontFamily, interFontFamily } from "../../fonts";
import { outExpo, springs } from "../../motion";
import {
  AnimatedBorderFrame,
  defaultBorderPalette,
} from "../components/AnimatedBorderFrame";

interface CodeTypewriterLayoutProps {
  step: VideoStep;
  theme: Theme;
  metrics: LayoutMetrics;
}

const TITLE_FRAMES = 14;
const TYPEWRITER_SECS = 1.5;
const NARRATION_DELAY_SECS = 0.4;

export const CodeTypewriterLayout: React.FC<CodeTypewriterLayoutProps> = ({
  step,
  theme,
  metrics,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: springs.enter });
  const mediaSpring = spring({
    frame: frame - TITLE_FRAMES / 2,
    fps,
    config: springs.enterSubtle,
  });

  const code = step.codeSnippet ?? "";
  const typewriterFrames = TYPEWRITER_SECS * fps;
  const typewriterStart = TITLE_FRAMES;
  const typewriterEnd = typewriterStart + typewriterFrames;
  const typewriterProgress = interpolate(
    frame,
    [typewriterStart, typewriterEnd],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: outExpo,
    },
  );
  const visibleChars = Math.floor(code.length * typewriterProgress);
  const visibleCode = code.slice(0, visibleChars);

  const cursorBlinkPhase = Math.floor((frame / fps) * 2) % 2;
  const showCursor = code.length > 0 && visibleChars < code.length;
  const cursor = showCursor || cursorBlinkPhase === 0 ? "▌" : " ";

  const resolveSrc = (src: string) =>
    src.startsWith("http") ? src : staticFile(src);
  const imageSrc = step.imageUrl ? resolveSrc(step.imageUrl) : null;
  const videoSrc = step.videoUrl ? resolveSrc(step.videoUrl) : null;
  const audioSrc = step.audioUrl ? resolveSrc(step.audioUrl) : null;

  // Ken Burns drift + optional region focus so small UI detail reads on mobile.
  const sceneFrames = step.durationInSeconds * fps;
  const kenBurns = interpolate(frame, [0, sceneFrames], [1, 1.06], {
    extrapolateRight: "clamp",
  });
  const imageScale = (step.imageFocus?.scale ?? 1) * kenBurns;
  const focusX = (step.imageFocus?.x ?? 0.5) * 100;
  const focusY = (step.imageFocus?.y ?? 0.5) * 100;

  const narrationStart = typewriterEnd + NARRATION_DELAY_SECS * fps;
  const narrationSpring = spring({
    frame: frame - narrationStart,
    fps,
    config: springs.enterSubtle,
  });

  return (
    <div
      style={{
        position: "absolute",
        top: metrics.contentTop,
        left: metrics.safePaddingX,
        right: metrics.safePaddingX,
        bottom: metrics.contentBottom,
        display: "flex",
        flexDirection: "column",
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
      {(videoSrc || imageSrc) && (
        <div
          style={{
            flex: "1 1 auto",
            minHeight: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            opacity: mediaSpring,
          }}
        >
          <AnimatedBorderFrame
            // colors={defaultBorderPalette(theme)}
            colors={[theme.brandColor]}
            borderRadius={metrics.codeRadius}
            outerStyle={{ maxWidth: "100%", maxHeight: "100%" }}
          >
            {videoSrc ? (
              <OffthreadVideo
                src={videoSrc}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            ) : (
              <Img
                src={imageSrc as string}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  transform: `scale(${imageScale})`,
                  transformOrigin: `${focusX}% ${focusY}%`,
                }}
              />
            )}
          </AnimatedBorderFrame>
        </div>
      )}
      {audioSrc && <Audio src={audioSrc} />}
      {code && (
        <Highlight
          code={visibleCode + (showCursor ? cursor : "")}
          language={(step.language ?? "javascript") as Language}
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
                  lineHeight: 1.45,
                  fontFamily: codeFontFamily,
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  flex: "1 1 auto",
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
