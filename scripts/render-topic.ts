import { execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { globSync } from 'glob';

const usage = () => {
  console.error(
    'Usage: pnpm render-topic <category>--<topic>--<version> [outputDir]'
  );
  console.error('Example: pnpm render-topic conceptos--array-filter--v1');
  console.error('         pnpm render-topic conceptos--array-filter--v1 out/april-batch');
  console.error('Renders every format file present under content/<category>/<topic>/<version>/.');
};

const topicId = process.argv[2];
if (!topicId) {
  usage();
  process.exit(1);
}

const match = topicId.match(/^([^-]+)--([^]+?)--(v\d+)$/);
if (!match) {
  console.error(`[render-topic] Invalid topic id: ${topicId}`);
  usage();
  process.exit(1);
}

const [, category, topic, version] = match;
const versionDir = `content/${category}/${topic}/${version}`;

if (!existsSync(versionDir)) {
  console.error(`[render-topic] Version folder not found: ${versionDir}`);
  process.exit(1);
}

// Discover format files. Each `<format>.ts` in the version folder is one composition.
const formatFiles = globSync(`${versionDir}/*.ts`).sort();
if (formatFiles.length === 0) {
  console.error(`[render-topic] No *.ts format files found in ${versionDir}`);
  process.exit(1);
}

const outputDir = process.argv[3] ?? `out/${topicId}`;
mkdirSync(outputDir, { recursive: true });

console.log(
  `[render-topic] Found ${formatFiles.length} format file(s) for ${topicId}.`
);

for (const file of formatFiles) {
  const format = file.split('/').pop()!.replace(/\.ts$/, '');
  const compositionId = `${topicId}--${format}`;
  const outputPath = `${outputDir}/${format}.mp4`;
  console.log(`\n→ Rendering ${compositionId} → ${outputPath}`);
  execSync(`pnpm exec remotion render ${compositionId} ${outputPath}`, {
    stdio: 'inherit',
  });
}

console.log(`\n✓ All formats rendered to ${outputDir}/`);
