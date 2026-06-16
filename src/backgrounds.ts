export type BackgroundKind =
  | 'solid'
  | 'gradient-drift'
  | 'noise'
  | 'grid'
  | 'particles'
  | 'diagonal-lines';

export const DEFAULT_BACKGROUND: BackgroundKind = 'gradient-drift';

export const backgroundKinds: readonly BackgroundKind[] = [
  'solid',
  'gradient-drift',
  'noise',
  'grid',
  'particles',
  'diagonal-lines',
] as const;
