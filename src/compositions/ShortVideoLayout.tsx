import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import type { TopicMetadata } from '../types/content';
import { resolveTheme } from '../theme';
import { getLayoutMetrics } from '../layout-metrics';
import { TitleBanner } from './components/TitleBanner';
import { CodeRunner } from './components/CodeRunner';
import { BrandFooter } from './components/BrandFooter';
import { OutroScene } from './components/OutroScene';
import { HookScene } from './components/HookScene';
import { outroStep } from '../outro';
import { backgroundMusic } from '../audio';
import { getTopicMusicFile } from '../music-resolve';
import { TOPIC_MUSIC_VOLUME } from '../music';
import { TRANSITION_FRAMES, resolveTransition } from '../motion';

export const ShortVideoLayout: React.FC<TopicMetadata> = ({
  category,
  id,
  version,
  displayTitle,
  theme,
  ctaQuestion,
  bgMusicFile,
  hook,
  timeline,
}) => {
  const { fps, width, height } = useVideoConfig();
  const resolvedTheme = resolveTheme(theme);
  const metrics = getLayoutMetrics(width, height);

  const hookFrames = hook ? Math.round(hook.durationInSeconds * fps) : 0;
  const contentFramesRaw = Math.round(
    timeline.reduce((acc, step) => acc + step.durationInSeconds, 0) * fps
  );
  const transitionOverlap = Math.max(0, timeline.length - 1) * TRANSITION_FRAMES;
  const contentFrames = contentFramesRaw - transitionOverlap;
  const outroFrames = Math.round(outroStep.durationInSeconds * fps);

  // Music precedence: manual bgMusicFile > per-topic (manifest) > global > none.
  const topicMusicFile = bgMusicFile ?? getTopicMusicFile(category, id, version);
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
      {hook && (
        <Sequence durationInFrames={hookFrames}>
          <HookScene hook={hook} theme={resolvedTheme} metrics={metrics} />
        </Sequence>
      )}

      <Sequence from={hookFrames} durationInFrames={contentFrames}>
        <TitleBanner title={displayTitle} theme={resolvedTheme} metrics={metrics} />
        <TransitionSeries>
          {timeline.flatMap((step, idx) => {
            const stepNode = (
              <TransitionSeries.Sequence
                key={`${step.id}-seq`}
                durationInFrames={Math.round(step.durationInSeconds * fps)}
              >
                <CodeRunner step={step} theme={resolvedTheme} metrics={metrics} />
              </TransitionSeries.Sequence>
            );
            if (idx === 0) return [stepNode];
            return [
              <TransitionSeries.Transition
                key={`${step.id}-trans`}
                presentation={resolveTransition(step.transition)}
                timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
              />,
              stepNode,
            ];
          })}
        </TransitionSeries>
        <BrandFooter metrics={metrics} />
      </Sequence>

      <Sequence from={hookFrames + contentFrames} durationInFrames={outroFrames}>
        <OutroScene theme={resolvedTheme} metrics={metrics} question={ctaQuestion} />
      </Sequence>

      {musicSrc && <Audio src={musicSrc} volume={musicVolume} loop />}
    </AbsoluteFill>
  );
};
