import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type { Theme } from '../../theme';
import type { LayoutMetrics } from '../../layout-metrics';
import { interFontFamily } from '../../fonts';
import {
  DEFAULT_OUTRO_QUESTION,
  FOLLOW_LABEL,
  HEART_IMAGE_URL,
  OUTRO_IMAGE_URL,
} from '../../outro';

interface OutroSceneProps {
  theme: Theme;
  metrics: LayoutMetrics;
  question?: string;
}

const resolveSrc = (src: string) =>
  src.startsWith('http') ? src : staticFile(src);

export const OutroScene: React.FC<OutroSceneProps> = ({
  theme,
  metrics,
  question,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 200 } });
  const imageOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const messageOpacity = interpolate(frame, [12, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.backgroundColor,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: metrics.contentGap,
        padding: metrics.safePaddingX,
        fontFamily: interFontFamily,
      }}
    >
      <Img
        src={resolveSrc(OUTRO_IMAGE_URL)}
        style={{
          width: '78%',
          maxHeight: '45%',
          objectFit: 'contain',
          opacity: imageOpacity,
          transform: `scale(${0.92 + 0.08 * enter})`,
        }}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: metrics.contentGap * 0.6,
          opacity: messageOpacity,
          maxWidth: '92%',
        }}
      >
        <span
          style={{
            color: theme.primaryColor,
            fontSize: metrics.stepTitleFontSize,
            fontWeight: 800,
            textAlign: 'center',
            lineHeight: 1.2,
          }}
        >
          {question ?? DEFAULT_OUTRO_QUESTION}
        </span>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: metrics.narrationFontSize * 0.5,
          }}
        >
          <span
            style={{
              color: theme.mutedTextColor,
              fontSize: metrics.narrationFontSize,
              fontWeight: 600,
            }}
          >
            {FOLLOW_LABEL}
          </span>
          <Img
            src={resolveSrc(HEART_IMAGE_URL)}
            style={{ height: metrics.narrationFontSize, objectFit: 'contain' }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
