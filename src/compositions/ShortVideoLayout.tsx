import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import type { TopicMetadata } from '../types/content';
import { resolveTheme } from '../theme';
import { getLayoutMetrics } from '../layout-metrics';
import { TitleBanner } from './components/TitleBanner';
import { CodeRunner } from './components/CodeRunner';
import { BrandFooter } from './components/BrandFooter';

export const ShortVideoLayout: React.FC<TopicMetadata> = ({
  displayTitle,
  theme,
  timeline,
}) => {
  const { fps, width, height } = useVideoConfig();
  const resolvedTheme = resolveTheme(theme);
  const metrics = getLayoutMetrics(width, height);
  let cursor = 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: resolvedTheme.backgroundColor,
        fontFamily: 'sans-serif',
      }}
    >
      <TitleBanner title={displayTitle} theme={resolvedTheme} metrics={metrics} />
      {timeline.map((step) => {
        const from = cursor;
        const durationInFrames = step.durationInSeconds * fps;
        cursor += durationInFrames;
        return (
          <Sequence key={step.id} from={from} durationInFrames={durationInFrames}>
            <CodeRunner step={step} theme={resolvedTheme} metrics={metrics} />
          </Sequence>
        );
      })}
      <BrandFooter metrics={metrics} />
    </AbsoluteFill>
  );
};
