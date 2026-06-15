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
import { HEART_IMAGE_URL, OUTRO_IMAGE_URL, OUTRO_MESSAGE } from '../../outro';

interface OutroSceneProps {
  theme: Theme;
  metrics: LayoutMetrics;
}

const resolveSrc = (src: string) =>
  src.startsWith('http') ? src : staticFile(src);

export const OutroScene: React.FC<OutroSceneProps> = ({ theme, metrics }) => {
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
          width: '82%',
          maxHeight: '55%',
          objectFit: 'contain',
          opacity: imageOpacity,
          transform: `scale(${0.92 + 0.08 * enter})`,
        }}
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: metrics.stepTitleFontSize * 0.4,
          opacity: messageOpacity,
        }}
      >
        <span
          style={{
            color: theme.primaryColor,
            fontSize: metrics.stepTitleFontSize,
            fontWeight: 800,
            textTransform: 'uppercase',
            textAlign: 'center',
          }}
        >
          {OUTRO_MESSAGE}
        </span>
        <Img
          src={resolveSrc(HEART_IMAGE_URL)}
          style={{ height: metrics.stepTitleFontSize, objectFit: 'contain' }}
        />
      </div>
    </AbsoluteFill>
  );
};
