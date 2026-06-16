/**
 * RFC-002 — Discovery: introspect the real `recordings` query args (is search filtering by
 * term, or is there a genre/tag filter?), and confirm whether `searchTerm` is ignored.
 * Read-only.
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
  const t = res?.content?.[0]?.text;
  const j = JSON.parse(t);
  if (j.errors) throw new Error(JSON.stringify(j.errors));
  return j.data;
};

async function main() {
  const transport = new StreamableHTTPClientTransport(new URL(MCP_URL), {
    requestInit: { headers: { Authorization: `Bearer ${apiKey}` } },
  });
  const client = new Client({ name: 'video-dev-tips-introspect', version: '1.0.0' });
  await client.connect(transport);

  // 1) Confirm searchTerm effect with two contrasting terms.
  for (const term of ['heavy metal', 'classical piano']) {
    const d = data(
      await client.callTool({
        name: 'SearchRecordings',
        arguments: { searchTerm: term, first: 3 },
      })
    );
    const titles = (d?.recordings?.nodes ?? [])
      .map((n: any) => n.recording?.title)
      .join(' · ');
    console.log(`CONTRAST "${term}": ${titles || '—'}`);
  }

  // 2) Introspect the Query root to see the recordings field + its argument input types.
  console.log('\n=== introspect Query ===');
  console.log(text(await client.callTool({ name: 'introspect', arguments: { type_name: 'Query', depth: 1 } })));

  // 3) Search the schema for likely filter/genre types.
  console.log('\n=== search schema: filter/genre/tag ===');
  console.log(text(await client.callTool({ name: 'search', arguments: { terms: ['RecordingSearchFilter', 'genre', 'tag'] } })));

  await client.close();
}

main().catch((e) => {
  console.error('❌', e instanceof Error ? e.message : e);
  process.exit(1);
});
