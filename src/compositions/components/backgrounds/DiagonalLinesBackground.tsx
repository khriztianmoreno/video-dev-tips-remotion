import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import type { Theme } from '../../../theme';

interface Props {
  theme: Theme;
}

// Brand key-visual accents (literal, like the alpha-byte literals in the other variants).
const ACCENT_BLUE = '#3D6CFF';
const ACCENT_ORANGE = '#FF7A3D';

const BASE_DRIFT = 10; // px/sec for the full-bleed hairline field
const STREAKS = 8; // bright diagonal streaks that shoot across and fade

/** A soft grid of twinkling dots centered at (cx%, cy%). */
const Dots: React.FC<{
  cx: number;
  cy: number;
  cols: number;
  rows: number;
  gap: number;
  size: number;
  color: string;
  t: number;
}> = ({ cx, cy, cols, rows, gap, size, color, t }) => {
  const dots = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const dx = (c - (cols - 1) / 2) * gap;
      const dy = (r - (rows - 1) / 2) * gap;
      const twinkle = 0.35 + 0.35 * Math.sin(t * 1.6 + i * 0.9);
      dots.push(
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `calc(${cx}% + ${dx}px)`,
            top: `calc(${cy}% + ${dy}px)`,
            width: size,
            height: size,
            borderRadius: '50%',
            backgroundColor: color,
            opacity: twinkle,
          }}
        />
      );
    }
  }
  return <>{dots}</>;
};

/** A twinkling 4-point sparkle glyph. */
const Sparkle: React.FC<{
  x: number;
  y: number;
  size: number;
  color: string;
  phase: number;
  t: number;
}> = ({ x, y, size, color, phase, t }) => {
  const pulse = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.2 + phase));
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        fontSize: size,
        lineHeight: 1,
        color,
        opacity: 0.25 + 0.55 * pulse,
        transform: `translate(-50%, -50%) scale(${0.7 + 0.3 * pulse})`,
      }}
    >
      ✦
    </div>
  );
};

/**
 * Brand background: flowing diagonal lines + the khriztianmoreno key-visual motifs.
 *  1. Full-bleed "/" hairline field drifting along the diagonal.
 *  2. Bright accent streaks (mint / blue / orange) crossing diagonally and fading.
 *  3. The soft curved arc (lighter purple lobe + thin edge) sweeping the lower area.
 *  4. Dot clusters and sparkles, gently twinkling.
 * Deterministic, looping, low-alpha so it stays behind centered content.
 */
export const DiagonalLinesBackground: React.FC<Props> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  const o1 = (t * BASE_DRIFT) % 54;
  const o2 = (t * BASE_DRIFT * 0.6) % 86;

  const field = (
    color: string,
    alpha: string,
    gap: number,
    off: number
  ): React.CSSProperties => ({
    position: 'absolute',
    inset: 0,
    backgroundImage: `repeating-linear-gradient(45deg, ${color}${alpha} 0px, ${color}${alpha} 1.5px, transparent 1.5px, transparent ${gap}px)`,
    backgroundPosition: `${off}px ${-off}px`,
  });

  const colors = [theme.primaryColor, ACCENT_BLUE, ACCENT_ORANGE];

  // Soft curved arc: a big circle centered below-left so its upper-right edge sweeps across.
  const arcDiameter = 2.2 * height;
  const arcCenterX = 0.15 * width;
  const arcCenterY = 1.5 * height;
  const arcBreathe = 1 + 0.012 * Math.sin(t * 0.2);
  const arcBox: React.CSSProperties = {
    position: 'absolute',
    width: arcDiameter,
    height: arcDiameter,
    left: arcCenterX - arcDiameter / 2,
    top: arcCenterY - arcDiameter / 2,
    borderRadius: '50%',
    transform: `scale(${arcBreathe})`,
    transformOrigin: 'center',
  };

  return (
    <AbsoluteFill style={{ backgroundColor: theme.backgroundColor }}>
      {/* Soft curved arc — a thin low-alpha band (the key-visual sweep), NOT a filled lobe. */}
      <div
        style={{
          ...arcBox,
          background: `radial-gradient(circle, transparent 55.5%, ${theme.primaryColor}12 57%, ${theme.brandColor}1c 58.5%, transparent 61%)`,
        }}
      />

      {/* Diagonal hairline field */}
      <div style={field(theme.primaryColor, '1a', 54, o1)} />
      <div style={field('#ffffff', '0e', 86, -o2)} />

      {/* Traveling accent streaks */}
      {Array.from({ length: STREAKS }).map((_, i) => {
        const color = colors[i % colors.length] as string;
        const speed = 0.09 + (i % 4) * 0.025;
        const phase = (i * 0.173) % 1;
        const p = (t * speed + phase) % 1;
        const lane = (i / (STREAKS - 1) - 0.5) * width * 1.3;
        const x = -0.25 * width + 1.5 * width * p + lane;
        const y = 1.25 * height - 1.5 * height * p + lane;
        const len = 150 + (i % 5) * 70;
        const fade = Math.min(p / 0.18, (1 - p) / 0.18, 1);
        const opacity = Math.max(0, fade) * 0.55;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: len,
              height: 3,
              borderRadius: 3,
              background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
              transform: `translate(${x}px, ${y}px) rotate(-45deg)`,
              transformOrigin: 'center',
              opacity,
            }}
          />
        );
      })}

      {/* Dot clusters + sparkles (key-visual motifs) */}
      <Dots cx={16} cy={74} cols={4} rows={4} gap={16} size={5} color={ACCENT_BLUE} t={t} />
      <Dots cx={85} cy={24} cols={3} rows={3} gap={18} size={5} color={theme.primaryColor} t={t} />
      <Sparkle x={9} y={64} size={34} color={ACCENT_ORANGE} phase={0} t={t} />
      <Sparkle x={13} y={70} size={20} color={ACCENT_ORANGE} phase={1.3} t={t} />
      <Sparkle x={90} y={78} size={26} color={theme.primaryColor} phase={2.1} t={t} />
      <Sparkle x={80} y={14} size={18} color={ACCENT_ORANGE} phase={0.7} t={t} />
    </AbsoluteFill>
  );
};
