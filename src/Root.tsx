import React from 'react';
import { Composition, staticFile } from 'remotion';
import { getAudioDurationInSeconds, getVideoMetadata } from '@remotion/media-utils';
import { ShortVideoLayout } from './compositions/ShortVideoLayout';
import { allTopics } from './_generated/topics';
import { formats } from './formats';
import { outroStep } from './outro';
import { TRANSITION_FRAMES } from './motion';
import type { VideoStep } from './types/content';

const FPS = 30;

const resolveSrc = (src: string) =>
  src.startsWith('http') ? src : staticFile(src);

const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Resolve each step's on-screen duration. When a scene has voiceover (`audioUrl`)
 * or a screen recording (`videoUrl`), the duration follows the media length so the
 * narration is never cut off. Falls back to the declared `durationInSeconds`.
 */
const resolveTimeline = async (timeline: VideoStep[]): Promise<VideoStep[]> =>
  Promise.all(
    timeline.map(async (step) => {
      try {
        if (step.audioUrl) {
          const sec = await getAudioDurationInSeconds(resolveSrc(step.audioUrl));
          return { ...step, durationInSeconds: round1(sec + 0.4) };
        }
        if (step.videoUrl) {
          const meta = await getVideoMetadata(resolveSrc(step.videoUrl));
          return { ...step, durationInSeconds: round1(meta.durationInSeconds) };
        }
      } catch {
        // Media unreadable at metadata time — keep the declared duration.
      }
      return step;
    })
  );

export const RemotionRoot: React.FC = () => (
  <>
    {allTopics.flatMap((topic) =>
      formats.map((format) => {
        const id = `${topic.category}--${topic.id}--${topic.version}--${format.id}`;
        return (
          <Composition
            key={id}
            id={id}
            component={ShortVideoLayout}
            fps={FPS}
            width={format.width}
            height={format.height}
            durationInFrames={1}
            defaultProps={topic}
            calculateMetadata={async ({ props }) => {
              const timeline = await resolveTimeline(props.timeline);
              const hookFrames = props.hook
                ? Math.round(props.hook.durationInSeconds * FPS)
                : 0;
              const contentFramesRaw = Math.round(
                timeline.reduce((acc, step) => acc + step.durationInSeconds, 0) * FPS
              );
              const transitionOverlap =
                Math.max(0, timeline.length - 1) * TRANSITION_FRAMES;
              const contentFrames = contentFramesRaw - transitionOverlap;
              const outroFrames = Math.round(outroStep.durationInSeconds * FPS);
              const durationInFrames = hookFrames + contentFrames + outroFrames;
              return { durationInFrames, props: { ...props, timeline } };
            }}
          />
        );
      })
    )}
  </>
);
