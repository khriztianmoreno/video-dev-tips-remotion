/**
 * RFC-002 Phase 1 — Spike: confirms we can talk to the Epidemic Sound MCP
 * over HTTP + API key, list its tools, and run a real `search_music` call.
 *
 * Usage:
 *   export EPIDEMIC_SOUND_API_KEY="..."   # https://www.epidemicsound.com/account/api-keys
 *   pnpm exec tsx scripts/spike-epidemic.ts
 *
 * It does not download anything or modify the project: read-only and reports.
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const MCP_URL = 'https://www.epidemicsound.com/a/mcp-service/mcp';

const apiKey = process.env.EPIDEMIC_SOUND_API_KEY;
if (!apiKey) {
  console.error(
    '\n❌ Missing EPIDEMIC_SOUND_API_KEY.\n' +
      '   Generate a key at https://www.epidemicsound.com/account/api-keys (expires after 30 days)\n' +
      '   and export it:  export EPIDEMIC_SOUND_API_KEY="..."\n'
  );
  process.exit(1);
}

const truncate = (obj: unknown, n = 1200) => {
  const s = JSON.stringify(obj, null, 2);
  return s.length > n ? s.slice(0, n) + '\n… (truncated)' : s;
};

async function main() {
  const transport = new StreamableHTTPClientTransport(new URL(MCP_URL), {
    requestInit: {
      headers: { Authorization: `Bearer ${apiKey}` },
    },
  });

  const client = new Client(
    { name: 'video-dev-tips-spike', version: '0.1.0' },
    { capabilities: {} }
  );

  console.log('→ Connecting to MCP:', MCP_URL);
  await client.connect(transport);
  console.log('✅ Connected.\n');

  // 1) List tools and their input schemas (so we know the exact arguments).
  const tools = await client.listTools();
  console.log(`🔧 Available tools (${tools.tools.length}):`);
  for (const t of tools.tools) {
    console.log(`\n— ${t.name}: ${t.description ?? ''}`);
    if (t.inputSchema) console.log('  inputSchema:', truncate(t.inputSchema, 1800));
  }

  // 2) Real music search. We try several argument shapes because the schema
  //    follows the GraphQL Connection pattern (searchTerm/first or others).
  const candidates = [
    { searchTerm: 'ambient tech', first: 3 },
    { term: 'ambient tech', first: 3 },
    { query: 'ambient tech', first: 3 },
    { searchTerm: 'ambient tech' },
  ];
  for (const args of candidates) {
    console.log('\n→ SearchRecordings with args:', JSON.stringify(args));
    try {
      const res = await client.callTool({ name: 'SearchRecordings', arguments: args });
      console.log('🎧 OK:\n', truncate(res, 2600));
      break;
    } catch (err) {
      console.warn('  ✗', err instanceof Error ? err.message : err);
    }
  }

  await client.close();
  console.log('\n✅ Spike finished.');
}

main().catch((err) => {
  console.error('\n❌ Spike failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
