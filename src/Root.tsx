import React from 'react';
import { Composition, Folder, staticFile } from 'remotion';
import { getAudioDurationInSeconds, getVideoMetadata } from '@remotion/media-utils';
import { ShortVideoLayout } from './compositions/ShortVideoLayout';
import { allTopics } from './_generated/topics';
import { formatById } from './formats';
import { outroStep } from './outro';
import { TRANSITION_FRAMES } from './motion';
import type { TopicMetadata, VideoStep } from './types/content';

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
          return { ...step, durationInSeconds: round1(sec + 1.2) };
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

// Group: category → topic--version → format variants.
// Each topic file targets ONE format, so the leaves of the tree are
// `<category>--<topic>--<version>--<format>` compositions.
const topicsByCategory: Record<string, TopicMetadata[]> = {};
for (const t of allTopics) {
  const list = topicsByCategory[t.category] ?? (topicsByCategory[t.category] = []);
  list.push(t);
}

const groupByVersion = (topics: TopicMetadata[]) => {
  const groups: Record<string, TopicMetadata[]> = {};
  for (const t of topics) {
    const key = `${t.id}--${t.version}`;
    const list = groups[key] ?? (groups[key] = []);
    list.push(t);
  }
  return groups;
};

export const RemotionRoot: React.FC = () => (
  <>
    {Object.entries(topicsByCategory).map(([category, topics]) => (
      <Folder key={category} name={category}>
        {Object.entries(groupByVersion(topics)).map(([versionKey, variants]) => (
          <Folder key={versionKey} name={versionKey}>
            {variants.map((topic) => {
              const format = formatById[topic.format];
              const id = `${topic.category}--${topic.id}--${topic.version}--${topic.format}`;
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
                    let hookSec = props.hook?.durationInSeconds ?? 0;
                    if (props.hook?.audioUrl) {
                      try {
                        const dur = await getAudioDurationInSeconds(
                          resolveSrc(props.hook.audioUrl)
                        );
                        hookSec = round1(dur + 0.7);
                      } catch {
                        // keep declared durationInSeconds
                      }
                    }
                    const hookFrames = Math.round(hookSec * FPS);
                    const contentFramesRaw = Math.round(
                      timeline.reduce(
                        (acc, step) => acc + step.durationInSeconds,
                        0
                      ) * FPS
                    );
                    const transitionOverlap =
                      Math.max(0, timeline.length - 1) * TRANSITION_FRAMES;
                    const contentFrames = contentFramesRaw - transitionOverlap;
                    const outroFrames = Math.round(
                      outroStep.durationInSeconds * FPS
                    );
                    const durationInFrames =
                      hookFrames + contentFrames + outroFrames;
                    const hook = props.hook
                      ? { ...props.hook, durationInSeconds: hookSec }
                      : undefined;
                    return { durationInFrames, props: { ...props, timeline, hook } };
                  }}
                />
              );
            })}
          </Folder>
        ))}
      </Folder>
    ))}
  </>
);
