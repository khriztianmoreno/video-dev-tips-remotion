/**
 * RFC-002 — Discovery: the real catalog filter is `recordings(filter: RecordingsFilter)`
 * with `taxonomySlugs` (genres). This checks which lo-fi genre slugs actually exist by
 * filtering on them and reading result counts + genre tags. Read-only.
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const MCP_URL = 'https://www.epidemicsound.com/a/mcp-service/mcp';
const apiKey = process.env.EPIDEMIC_SOUND_API_KEY;
if (!apiKey) {
  console.error('\n❌ Missing EPIDEMIC_SOUND_API_KEY.\n');
  process.exit(1);
}

const text = (res: any): string => res?.content?.map((c: any) => c.text).join('\n') ?? '';
const data = (res: any) => {
  const j = JSON.parse(res?.content?.[0]?.text ?? '{}');
  if (j.errors) throw new Error(JSON.stringify(j.errors));
  return j.data;
};

const CANDIDATE_SLUGS = [
  'lo-fi-hip-hop',
  'lofi-hip-hop',
  'lo-fi-house',
  'lofi-house',
  'house',
  'ambient',
  'synthwave',
  'chillhop',
];

async function main() {
  const transport = new StreamableHTTPClientTransport(new URL(MCP_URL), {
    requestInit: { headers: { Authorization: `Bearer ${apiKey}` } },
  });
  const client = new Client({ name: 'video-dev-tips-genre', version: '1.0.0' });
  await client.connect(transport);

  // Get FilterMatchType enum values.
  const fmt = text(
    await client.callTool({ name: 'introspect', arguments: { type_name: 'FilterMatchType' } })
  );
  const match = fmt.match(/enum FilterMatchType \{([^}]*)\}/);
  const matchType = (match?.[1]?.trim().split(/\s+/)[0]) ?? 'ALL';
  console.log(`FilterMatchType values: ${match?.[1]?.trim().replace(/\s+/g, ', ')}; using "${matchType}"`);

  const QUERY =
    'query($f: RecordingsFilter!) { recordings(filter: $f, first: 5) { nodes { recording { title tags { displayName dimension { name } } } } } }';

  for (const slug of CANDIDATE_SLUGS) {
    try {
      const d = data(
        await client.callTool({
          name: 'execute',
          arguments: {
            query: QUERY,
            variables: JSON.stringify({ f: { taxonomySlugs: { matchType, values: [slug] } } }),
          },
        })
      );
      const nodes = (d?.recordings?.nodes ?? []).map((n: any) => n.recording);
      const genreTags = new Set<string>();
      for (const r of nodes)
        for (const t of r.tags ?? [])
          if (t?.dimension?.name === 'genre') genreTags.add(t.displayName);
      console.log(
        `\n✓ "${slug}" → ${nodes.length} hits | títulos: ${nodes.slice(0, 2).map((r: any) => r.title).join(' · ') || '—'}`
      );
      console.log(`   géneros presentes: ${[...genreTags].join(', ') || '—'}`);
    } catch (e) {
      console.log(`\n✗ "${slug}" → ${e instanceof Error ? e.message.slice(0, 120) : e}`);
    }
  }

  await client.close();
}

main().catch((e) => {
  console.error('❌', e instanceof Error ? e.message : e);
  process.exit(1);
});
