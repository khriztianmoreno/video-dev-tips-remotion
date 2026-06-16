import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import type { TopicMetadata } from '../types/content';
import { resolveTheme } from '../theme';
import { getLayoutMetrics } from '../layout-metrics';
import { TitleBanner } from './components/TitleBanner';
import { CodeRunner } from './components/CodeRunner';
import { BrandFooter } from './components/BrandFooter';
import { OutroScene } from './components/OutroScene';
import { outroStep } from '../outro';
import { backgroundMusic } from '../audio';
import { getTopicMusicFile } from '../music-resolve';
import { TOPIC_MUSIC_VOLUME } from '../music';

export const ShortVideoLayout: React.FC<TopicMetadata> = ({
  category,
  id,
  version,
  displayTitle,
  theme,
  ctaQuestion,
  timeline,
}) => {
  const { fps, width, height } = useVideoConfig();
  const resolvedTheme = resolveTheme(theme);
  const metrics = getLayoutMetrics(width, height);

  const contentFrames =
    timeline.reduce((acc, step) => acc + step.durationInSeconds, 0) * fps;
  const outroFrames = outroStep.durationInSeconds * fps;
  let cursor = 0;

  // Music precedence: per-topic (manifest) > global (src/audio.ts) > none.
  const topicMusicFile = getTopicMusicFile(category, id, version);
  const musicPath = topicMusicFile ?? backgroundMusic.src;
  const musicVolume = topicMusicFile ? TOPIC_MUSIC_VOLUME : backgroundMusic.volume;
  const musicSrc = musicPath
    ? musicPath.startsWith('http')
      ? musicPath
      : staticFile(musicPath)
    : null;

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
        <OutroScene
          theme={resolvedTheme}
          metrics={metrics}
          question={ctaQuestion}
        />
      </Sequence>

      {musicSrc && <Audio src={musicSrc} volume={musicVolume} loop />}
    </AbsoluteFill>
  );
};
