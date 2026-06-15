import { execSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { formats } from '../src/formats';

const topicId = process.argv[2];

if (!topicId) {
  console.error(
    'Usage: pnpm render-topic <category>--<topic>--<version> [outputDir]'
  );
  console.error('Example: pnpm render-topic conceptos--array-filter--v1');
  console.error('         pnpm render-topic conceptos--array-filter--v1 out/april-batch');
  process.exit(1);
}

const outputDir = process.argv[3] ?? `out/${topicId}`;
mkdirSync(outputDir, { recursive: true });

for (const format of formats) {
  const compositionId = `${topicId}--${format.id}`;
  const outputPath = `${outputDir}/${format.id}.mp4`;
  console.log(`\n→ Rendering ${compositionId} (${format.aspectRatio}) → ${outputPath}`);
  execSync(`pnpm exec remotion render ${compositionId} ${outputPath}`, {
    stdio: 'inherit',
  });
}

console.log(`\n✓ All formats rendered to ${outputDir}/`);
