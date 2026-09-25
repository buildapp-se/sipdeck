// Kör Workern i node utan Cloudflare: D1 = node:sqlite med schema.sql, Googles JWKS = en egen RSA-nyckel.
// Token verifieras på riktigt (RS256, aud, iss, tider), bara nyckelkällan är utbytt. `node worker/worker.test.mjs`
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import worker from './worker.js';

const sqlite = new DatabaseSync(':memory:');
sqlite.exec(readFileSync(new URL('./schema.sql', import.meta.url), 'utf8'));
const DB = {
  prepare(sql) {
    const st = sqlite.prepare(sql);
    let args = [];
    const q = {
      bind(...a) { args = a; return q; },
      first: async () => st.get(...args) ?? null,
      all: async () => ({ results: st.all(...args) }),
      run: async () => { const r = st.run(...args); return { meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) } }; },
    };
    return q;
  },
};
const mails = [], pending = [];
let mailFails = false;
const MAIL = { send: async m => { if (mailFails) throw new Error('testfel: smtp nere'); mails.push(m); } };
const env = { DB, MAIL, ADMIN_TOKEN: 'a'.repeat(40) };
const ctx = { waitUntil: p => pending.push(p) };

const { publicKey, privateKey } = await crypto.subtle.generateKey(
  { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
const jwk = Object.assign(await crypto.subtle.exportKey('jwk', publicKey), { kid: 'test' });
globalThis.fetch = async () => Response.json({ keys: [jwk] });
const b64 = o => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');
async function token(sub) {
  const now = Math.floor(Date.now() / 1000);
  const head = b64({ alg: 'RS256', kid: 'test' }) + '.' + b64({ aud: 'sipdeck', iss: 'https://securetoken.google.com/sipdeck',
    sub, iat: now - 5, auth_time: now - 5, exp: now + 3600 });
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', privateKey, new TextEncoder().encode(head));
  return head + '.' + Buffer.from(sig).toString('base64url');
}
const tokens = { alice: await token('alice'), bob: await token('bob') };
async function call(method, path, { who, body, auth } = {}) {
  const headers = { Authorization: auth || (who ? 'Bearer ' + tokens[who] : '') };
  const res = await worker.fetch(new Request('https://api.test' + path, { method, headers, body: body && JSON.stringify(body) }), env, ctx);
  await Promise.all(pending.splice(0));
  return { status: res.status, data: await res.json() };
}

let pass = 0, fail = 0;
const check = (cond, msg) => { if (cond) pass++; else { fail++; console.error('FAIL: ' + msg); } };
const drink = (id, name = 'Kvällens sour') => ({ id, custom: true, name, glass: 'coupe', color: 'citrus', bar: false, tags: [],
  ingredients: [{ id: 'bourbon', ml: 50, essential: true }, { id: 'lemon-juice', ml: 25, essential: true }], method: { en: 'Skaka.' } });

// F2 /drinks
check((await call('GET', '/drinks')).status === 401, 'drinks: no token is 401');
check((await call('PUT', '/drinks/egen-1', { who: 'alice', body: { drink: drink('egen-1'), updatedAt: 100 } })).status === 200, 'drinks: put');
check(mails.length === 1 && mails[0].subject === 'Sipdeck: Mina drinkar används' && /med egna drinkar: 1\./.test(mails[0].text) &&
  !/Kvällens/.test(mails[0].text), 'drinks: the first drink mails the curator, without its content');
check((await call('PUT', '/drinks/egen-5', { who: 'alice', body: { drink: drink('egen-5'), updatedAt: 100 } })).status === 200 &&
  (await call('PUT', '/drinks/egen-5', { who: 'alice', body: { drink: drink('egen-5', 'Ny'), updatedAt: 101 } })).status === 200 &&
  mails.length === 1, 'drinks: a second drink or an edit sends no mail');
check((await call('PUT', '/drinks/egen-1', { who: 'alice', body: { drink: drink('egen-1', 'Gammal'), updatedAt: 50 } })).status === 409,
  'drinks: an older write is refused');
check((await call('GET', '/drinks/egen-1', { who: 'alice' })).data.drink.name === 'Kvällens sour', 'drinks: the newer version stays');
check((await call('PUT', '/drinks/egen-2', { who: 'alice', body: { drink: drink('egen-3'), updatedAt: 1 } })).status === 400,
  'drinks: body id must match the path');
check((await call('PUT', '/drinks/egen-2', { who: 'alice', body: { drink: Object.assign(drink('egen-2'), { glass: 'bucket' }), updatedAt: 1 } })).status === 400,
  'drinks: shared rules reject an unknown glass');
check((await call('GET', '/drinks', { who: 'bob' })).data.drinks.length === 0, 'drinks: another user sees nothing');
mailFails = true;
check((await call('PUT', '/drinks/egen-1', { who: 'bob', body: { drink: drink('egen-1'), updatedAt: 1 } })).status === 200 &&
  (await call('GET', '/drinks/egen-1', { who: 'bob' })).status === 200, 'drinks: a throwing mail still saves the first drink');
mailFails = false;
check((await call('DELETE', '/drinks/egen-1?updatedAt=200', { who: 'alice' })).status === 200, 'drinks: delete');
const listed = (await call('GET', '/drinks', { who: 'alice' })).data.drinks;
const tomb = listed.find(r => r.id === 'egen-1');
check(listed.length === 2 && tomb.drink === null && tomb.updatedAt === 200, 'drinks: a deletion stays as a tombstone');
check((await call('PUT', '/drinks/egen-1', { who: 'alice', body: { drink: drink('egen-1'), updatedAt: 150 } })).status === 409,
  'drinks: a stale device cannot bring a deleted drink back');

// F3 /suggestions
mails.length = 0;
const suggestion = { drink: drink('egen-9'), kind: 'variant', similarTo: 'whiskey-sour', source: 'Egen skapelse', displayName: 'Patrik', consent: true };
check((await call('POST', '/suggestions', { who: 'alice', body: Object.assign({}, suggestion, { consent: false }) })).status === 400,
  'suggestions: consent is required');
const first = await call('POST', '/suggestions', { who: 'alice', body: suggestion });
check(first.status === 201 && first.data.status === 'new', 'suggestions: created as new');
check(mails.length === 1 && mails[0].to === 'patz.lofgren@gmail.com' && mails[0].subject === 'Sipdeck: nytt förslag #' + first.data.id &&
  /Kvällens sour/.test(mails[0].text) && /Typ: variant/.test(mails[0].text) && /whiskey-sour/.test(mails[0].text) &&
  /suggestions\.js pull/.test(mails[0].text), 'suggestions: one mail with id, name, kind, similar drink and pull command');
for (let i = 0; i < 4; i++) await call('POST', '/suggestions', { who: 'alice', body: suggestion });
check((await call('POST', '/suggestions', { who: 'alice', body: suggestion })).status === 429, 'suggestions: the sixth in a day is refused');
check(mails.length === 5, 'suggestions: no mail for a 400 or a 429');
mailFails = true;
const bobs = await call('POST', '/suggestions', { who: 'bob', body: suggestion });
mailFails = false;
check(bobs.status === 201 && sqlite.prepare("SELECT COUNT(*) AS n FROM suggestions WHERE firebase_uid = 'bob'").get().n === 1,
  'suggestions: the limit is per user, and a throwing mail still saves the suggestion');
const mine = (await call('GET', '/suggestions/mine', { who: 'alice' })).data.suggestions;
check(mine.length === 5 && mine[0].custom_id === 'egen-9' && mine[0].status === 'new', 'suggestions/mine: own rows with the drink id');

// admin
check((await call('GET', '/admin/suggestions', { auth: 'Bearer ' + 'b'.repeat(40) })).status === 401, 'admin: wrong token is 401');
check((await call('GET', '/admin/suggestions', { who: 'alice' })).status === 401, 'admin: a user token is not admin');
const admin = { auth: 'Bearer ' + env.ADMIN_TOKEN };
const queue = (await call('GET', '/admin/suggestions?status=new', admin)).data.suggestions;
check(queue.length === 6 && queue[0].payload.drink.name === 'Kvällens sour', 'admin: lists new suggestions with parsed payload');
check((await call('POST', '/admin/suggestions/' + first.data.id, Object.assign({ body: { status: 'published' } }, admin))).status === 400,
  'admin: publish needs a drink id');
check((await call('POST', '/admin/suggestions/' + first.data.id, Object.assign({ body: { status: 'published', drink_id: 'kvallens-sour' } }, admin))).status === 200,
  'admin: publish');
check((await call('POST', '/admin/suggestions/2', Object.assign({ body: { status: 'declined', note: 'Finns redan.' } }, admin))).status === 200,
  'admin: decline with a note');
const after = (await call('GET', '/suggestions/mine', { who: 'alice' })).data.suggestions;
check(after[0].status === 'published' && after[0].drink_id === 'kvallens-sour' && after[1].note === 'Finns redan.', 'suggestions/mine: shows the review');
check((await call('POST', '/admin/suggestions/999', Object.assign({ body: { status: 'declined' } }, admin))).status === 404, 'admin: unknown id is 404');

// DELETE /account
check((await call('DELETE', '/account', { who: 'alice' })).status === 200, 'account: delete');
const left = sqlite.prepare('SELECT firebase_uid, status FROM suggestions ORDER BY id').all();
check(left.filter(r => r.firebase_uid === 'alice').length === 0, 'account: no suggestion keeps the uid');
check(left.length === 2 && left[0].status === 'published' && left[0].firebase_uid === '' && left[1].firebase_uid === 'bob',
  'account: new/declined are deleted, the published one stays unlinked, other users untouched');
check(sqlite.prepare("SELECT COUNT(*) AS n FROM user_drinks WHERE firebase_uid = 'alice'").get().n === 0, 'account: own drinks are deleted');
check((await call('GET', '/drinks', { who: 'alice' })).status === 401, 'account: the old token is blocked afterwards');

console.log(`worker: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
