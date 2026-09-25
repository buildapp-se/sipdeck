'use strict';
// F3 curator CLI. The admin token is the Worker secret ADMIN_TOKEN; pass it in the environment, never on the command line.
//   SIPDECK_ADMIN_TOKEN=... node scripts/suggestions.js pull                  new suggestions -> suggestions/<id>.json
//   SIPDECK_ADMIN_TOKEN=... node scripts/suggestions.js decline <id> "<note>"
//   SIPDECK_ADMIN_TOKEN=... node scripts/suggestions.js publish <id> <drink-id>
// SIPDECK_API overrides the API (e.g. http://127.0.0.1:8787 for wrangler dev).
const fs = require('fs');
const path = require('path');

const API = process.env.SIPDECK_API || 'https://sipdeck-api.sipdeck.workers.dev';
const TOKEN = process.env.SIPDECK_ADMIN_TOKEN;
const [cmd, id, arg] = process.argv.slice(2);

async function admin(route, body) {
  const res = await fetch(API + route, {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: body && JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data) throw new Error(`${res.status} ${(data && data.error) || 'not a Sipdeck API response'}`);
  return data;
}

async function main() {
  if (!TOKEN) throw new Error('SIPDECK_ADMIN_TOKEN is not set.');
  if (cmd === 'pull') {
    const dir = path.join(__dirname, '..', 'suggestions');
    fs.mkdirSync(dir, { recursive: true });
    const { suggestions } = await admin('/admin/suggestions?status=new');
    suggestions.forEach(s => fs.writeFileSync(path.join(dir, `${s.id}.json`), JSON.stringify(s, null, 2) + '\n'));
    console.log(`${suggestions.length} new suggestion(s) in suggestions/`);
  } else if (cmd === 'decline' && /^\d+$/.test(id || '') && arg) {
    await admin('/admin/suggestions/' + id, { status: 'declined', note: arg });
    console.log(`#${id} declined`);
  } else if (cmd === 'publish' && /^\d+$/.test(id || '') && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(arg || '')) {
    await admin('/admin/suggestions/' + id, { status: 'published', drink_id: arg });
    console.log(`#${id} published as ${arg}`);
  } else {
    throw new Error('usage: pull | decline <id> "<note>" | publish <id> <drink-id>');
  }
}

main().catch(err => { console.error(err.message); process.exit(1); });
