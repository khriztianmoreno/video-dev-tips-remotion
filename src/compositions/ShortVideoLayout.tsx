import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import type { TopicMetadata } from '../types/content';
import { resolveTheme } from '../theme';
import { getLayoutMetrics } from '../layout-metrics';
import { TitleBanner } from './components/TitleBanner';
import { CodeRunner } from './components/CodeRunner';
import { BrandFooter } from './components/BrandFooter';
import { OutroScene } from './components/OutroScene';
import { outroStep } from '../outro';

export const ShortVideoLayout: React.FC<TopicMetadata> = ({
  displayTitle,
  theme,
  timeline,
}) => {
  const { fps, width, height } = useVideoConfig();
  const resolvedTheme = resolveTheme(theme);
  const metrics = getLayoutMetrics(width, height);

  const contentFrames =
    timeline.reduce((acc, step) => acc + step.durationInSeconds, 0) * fps;
  const outroFrames = outroStep.durationInSeconds * fps;
  let cursor = 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: resolvedTheme.backgroundColor,
        fontFamily: 'sans-serif',
      }}
    >
      {/* Content scenes: title banner + footer persist only here, not on the outro. */}
      <Sequence durationInFrames={contentFrames}>
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
      </Sequence>

      {/* Brand outro: own scene, no title banner, no footer. */}
      <Sequence from={contentFrames} durationInFrames={outroFrames}>
        <OutroScene theme={resolvedTheme} metrics={metrics} />
      </Sequence>
    </AbsoluteFill>
  );
};
