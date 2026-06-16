/**
 * RFC-002 — Discovery: check which lo-fi-style search terms actually return results in the
 * Epidemic Sound catalog, and what real `genre` tags they carry. Read-only.
 *
 * Usage:
 *   export EPIDEMIC_SOUND_API_KEY="..."
 *   pnpm exec tsx scripts/spike-music-genres.ts
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const MCP_URL = 'https://www.epidemicsound.com/a/mcp-service/mcp';

const TERMS = [
  'lo-fi hip hop',
  'lofi hip hop beats',
  'lo-fi house',
  'lofi',
  'chillhop',
];

const apiKey = process.env.EPIDEMIC_SOUND_API_KEY;
if (!apiKey) {
  console.error('\n❌ Missing EPIDEMIC_SOUND_API_KEY.\n');
  process.exit(1);
}

const toolData = (res: any): any => {
  const text = res?.content?.[0]?.text;
  if (!text) throw new Error('Empty tool result');
  const json = JSON.parse(text);
  if (json.errors) throw new Error(`GraphQL: ${JSON.stringify(json.errors)}`);
  return json.data;
};

async function main() {
  const transport = new StreamableHTTPClientTransport(new URL(MCP_URL), {
    requestInit: { headers: { Authorization: `Bearer ${apiKey}` } },
  });
  const client = new Client({ name: 'video-dev-tips-genres', version: '1.0.0' });
  await client.connect(transport);

  for (const term of TERMS) {
    try {
      const data = toolData(
        await client.callTool({
          name: 'SearchRecordings',
          arguments: { searchTerm: term, first: 10 },
        })
      );
      const nodes: any[] = (data?.recordings?.nodes ?? []).map((n: any) => n.recording);
      const genres = new Map<string, number>();
      for (const r of nodes) {
        for (const t of r.tags ?? []) {
          if (t?.dimension?.name === 'genre') {
            genres.set(t.displayName, (genres.get(t.displayName) ?? 0) + 1);
          }
        }
      }
      const topGenres = [...genres.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([g, n]) => `${g}(${n})`)
        .join(', ');
      console.log(`\n🔎 "${term}" → ${nodes.length} resultados`);
      console.log(`   títulos: ${nodes.slice(0, 3).map((r) => r.title).join(' · ') || '—'}`);
      console.log(`   géneros (tag dimension=genre): ${topGenres || '—'}`);
    } catch (err) {
      console.warn(`\n🔎 "${term}" → ✗ ${err instanceof Error ? err.message : err}`);
    }
  }

  await client.close();
  console.log('\n✅ Discovery terminado.');
}

main().catch((err) => {
  console.error('\n❌ Falló:', err instanceof Error ? err.message : err);
  process.exit(1);
});
