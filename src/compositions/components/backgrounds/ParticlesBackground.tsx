import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import type { Theme } from '../../../theme';

interface Props {
  theme: Theme;
}

/**
 * 14 small circles distributed via the golden angle, each drifting on its own sine
 * orbit. The distribution avoids visible clustering; per-particle speed and amplitude
 * vary so they don't move in sync. Renders as plain `<div>` — no extra deps.
 */
const PARTICLE_COUNT = 14;
const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  id: i,
  x: (i * 137.508) % 100,
  y: (i * 73.379) % 100,
  size: 10 + (i % 4) * 6,
  speed: 0.18 + (i % 5) * 0.04,
  amplitude: 28 + (i % 3) * 18,
  phase: (i * 17) % 7,
}));

export const ParticlesBackground: React.FC<Props> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  return (
    <AbsoluteFill style={{ backgroundColor: theme.backgroundColor }}>
      {PARTICLES.map((p) => {
        const dx = Math.sin(t * p.speed + p.phase) * p.amplitude;
        const dy = Math.cos(t * p.speed * 0.7 + p.phase) * p.amplitude;
        const color = p.id % 2 === 0 ? theme.primaryColor : theme.brandColor;
        return (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `calc(${p.x}% + ${dx}px)`,
              top: `calc(${p.y}% + ${dy}px)`,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              backgroundColor: color,
              opacity: 0.18,
              filter: 'blur(1px)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
