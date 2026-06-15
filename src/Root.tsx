import React from 'react';
import { Composition } from 'remotion';
import { ShortVideoLayout } from './compositions/ShortVideoLayout';
import { allTopics } from './_generated/topics';
import { formats } from './formats';

const FPS = 30;

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
            calculateMetadata={({ props }) => ({
              durationInFrames:
                props.timeline.reduce(
                  (acc, step) => acc + step.durationInSeconds,
                  0
                ) * FPS,
            })}
          />
        );
      })
    )}
  </>
);
