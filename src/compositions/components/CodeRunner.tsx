import React from 'react';
import type { VideoStep } from '../../types/content';
import type { Theme } from '../../theme';
import type { LayoutMetrics } from '../../layout-metrics';
import { CodeTypewriterLayout } from '../layouts/CodeTypewriterLayout';
import { CodeCalloutLayout } from '../layouts/CodeCalloutLayout';
import { QuoteHeroLayout } from '../layouts/QuoteHeroLayout';

interface CodeRunnerProps {
  step: VideoStep;
  theme: Theme;
  metrics: LayoutMetrics;
}

/**
 * Dispatcher that picks the per-step layout component. Adding a new layout is
 * a two-line change: register the case here and add the corresponding
 * `StepLayout` value in `src/types/content.ts`.
 */
export const CodeRunner: React.FC<CodeRunnerProps> = (props) => {
  switch (props.step.layout) {
    case 'code-callout':
      return <CodeCalloutLayout {...props} />;
    case 'quote-hero':
      return <QuoteHeroLayout {...props} />;
    case 'code-typewriter':
    default:
      return <CodeTypewriterLayout {...props} />;
  }
};
