export type BackgroundKind =
  | 'solid'
  | 'gradient-drift'
  | 'noise'
  | 'grid'
  | 'particles';

export const DEFAULT_BACKGROUND: BackgroundKind = 'gradient-drift';

export const backgroundKinds: readonly BackgroundKind[] = [
  'solid',
  'gradient-drift',
  'noise',
  'grid',
  'particles',
] as const;
