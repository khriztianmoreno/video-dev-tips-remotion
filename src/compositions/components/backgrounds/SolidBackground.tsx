import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { Theme } from '../../../theme';

interface Props {
  theme: Theme;
}

export const SolidBackground: React.FC<Props> = ({ theme }) => (
  <AbsoluteFill style={{ backgroundColor: theme.backgroundColor }} />
);
