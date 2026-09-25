// API för Sipdeck (sync, v1.2). Auth: Firebase ID-token (JWT, verifieras mot Googles JWKS).
// GET    /state    (Bearer) -> {state}
// PUT    /state    (Bearer) <- hela state-bloben {v,favorites,pantry,settings}
// GET    /drinks   (Bearer) -> {drinks:[{id,drink,updatedAt}]}  F2, drink null = raderad
// GET|PUT|DELETE /drinks/:id (Bearer)  PUT <- {drink,updatedAt}, DELETE ?updatedAt=; nyaste ändringen vinner
// POST   /suggestions      (Bearer) <- {drink,kind,similarTo,source,displayName,consent}  F3, max 5 per dygn
// GET    /suggestions/mine (Bearer) -> {suggestions:[...]}
// GET    /admin/suggestions?status=new, POST /admin/suggestions/:id <- {status,note,drink_id}  (Bearer ADMIN_TOKEN)
// DELETE /account  (Bearer) -> {ok}  raderar state, egna drinkar och ej publicerade förslag; spärrmarkören städas efter två timmar
import { drinkErrors, KEBAB } from './drink-rules.js';

const FIREBASE_PROJECT = 'sipdeck';
const MAX_DRINKS = 100, SUGGESTIONS_PER_DAY = 5, DAY = 24 * 60 * 60 * 1000;
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
const json = (d, s = 200) => Response.json(d, { status: s, headers: cors });

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
async function readJson(req, max) {
  const body = await req.text();
  if (body.length > max) throw new HttpError(413, 'För mycket data.');
  try { return JSON.parse(body); } catch (e) { throw new HttpError(400, 'Ogiltig data.'); }
}
async function requireUser(req, env) {
  const u = await userFromRequest(req, env);
  if (!u) throw new HttpError(401, 'Inte inloggad.');
  return u;
}
const optText = (v, max) => v === undefined || v === null || (typeof v === 'string' && v.length <= max);

// ponytail: jämför SHA-256 av båda sidor, så svarstiden säger inget om själva token
async function isAdmin(req, env) {
  const token = (req.headers.get('Authorization') || '').replace(/^Bearer /, '');
  if (typeof env.ADMIN_TOKEN !== 'string' || env.ADMIN_TOKEN.length < 32) return false;
  return await stateEtag(token) === await stateEtag(env.ADMIN_TOKEN);
}
const drinkRow = r => ({ id: r.id, drink: r.drink_json ? JSON.parse(r.drink_json) : null, updatedAt: r.updated_at });
const suggestionRow = r => Object.assign(r, { payload: JSON.parse(r.payload) });

// ---- Firebase ID-token-verifiering (RS256 mot Googles publika JWKS, ingen SDK) ----
let jwksCache = null, jwksExpires = 0, jwksMissRefresh = 0;
async function refreshJwks() {
  const res = await fetch('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com');
  if (!res.ok) return false;
  const body = await res.json();
  if (!Array.isArray(body.keys)) return false;
  const m = /max-age=(\d+)/.exec(res.headers.get('Cache-Control') || '');
  jwksExpires = Date.now() + (m ? Number(m[1]) : 3600) * 1000;
  jwksCache = body.keys;
  return true;
}
async function googleJwk(kid) {
  let refreshed = false;
  if (!jwksCache || Date.now() > jwksExpires) refreshed = await refreshJwks();
  let key = jwksCache && jwksCache.find(k => k.kid === kid);
  if (!key && !refreshed && Date.now() - jwksMissRefresh > 60000) {
    jwksMissRefresh = Date.now();
    await refreshJwks();
    key = jwksCache && jwksCache.find(k => k.kid === kid);
  }
  return key || null;
}

function b64urlToBytes(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  s += '='.repeat((4 - (s.length % 4)) % 4);
  return Uint8Array.from(atob(s), c => c.charCodeAt(0));
}

async function verifyFirebaseToken(token) {
  try {
    const [h, p, sig] = token.split('.');
    const header = JSON.parse(new TextDecoder().decode(b64urlToBytes(h)));
    if (header.alg !== 'RS256') return null;
    const jwk = await googleJwk(header.kid);
    if (!jwk) return null;
    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64urlToBytes(sig), new TextEncoder().encode(h + '.' + p));
    if (!ok) return null;
    const c = JSON.parse(new TextDecoder().decode(b64urlToBytes(p)));
    const now = Date.now() / 1000;
    if (c.aud !== FIREBASE_PROJECT || c.iss !== 'https://securetoken.google.com/' + FIREBASE_PROJECT) return null;
    if (!(c.exp > now) || !(c.iat <= now) || !(c.auth_time <= now)
      || typeof c.sub !== 'string' || !c.sub) return null;
    return c;
  } catch (e) {
    return null;
  }
}

function isDeleted(u) {
  try { return Number.isFinite(JSON.parse(u.state).deletedAt); } catch (e) { return false; }
}

async function userFromRequest(req, env, allowDeleted = false) {
  const t = (req.headers.get('Authorization') || '').replace(/^Bearer /, '');
  if (t.split('.').length !== 3) return null;
  const claims = await verifyFirebaseToken(t);
  if (!claims) return null;
  let u = await env.DB.prepare('SELECT * FROM users WHERE firebase_uid = ?').bind(claims.sub).first();
  if (!u) {
    await env.DB.prepare('INSERT INTO users (firebase_uid, state) VALUES (?, ?)').bind(claims.sub, '').run().catch(() => {});
    u = await env.DB.prepare('SELECT * FROM users WHERE firebase_uid = ?').bind(claims.sub).first();
  }
  return u && (allowDeleted || !isDeleted(u)) ? u : null;
}

async function stateEtag(raw) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  return Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('');
}

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    const url = new URL(req.url), path = url.pathname;
    try {
      if (path === '/state') {
        const u = await userFromRequest(req, env);
        if (!u) return json({ error: 'Inte inloggad.' }, 401);
        if (req.method === 'GET') return json({
          state: u.state ? JSON.parse(u.state) : null,
          etag: await stateEtag(u.state),
        });
        if (req.method === 'PUT') {
          const body = await req.text();
          if (body.length > 65536) return json({ error: 'För mycket data (max 64 kB).' }, 413);
          let request;
          try { request = JSON.parse(body); } catch (e) { return json({ error: 'Ogiltig data.' }, 400); }
          const s = request && request.state;
          if (!s || typeof s !== 'object' || !Array.isArray(s.favorites) || !Array.isArray(s.pantry)) {
            return json({ error: 'Ogiltig data.' }, 400);
          }
          const currentEtag = await stateEtag(u.state);
          if (request.etag !== currentEtag) {
            return json({ error: 'Synkkonflikt.', state: u.state ? JSON.parse(u.state) : null, etag: currentEtag }, 409);
          }
          const next = JSON.stringify(s);
          const result = await env.DB.prepare('UPDATE users SET state = ? WHERE id = ? AND state = ?')
            .bind(next, u.id, u.state).run();
          if (!result.meta || result.meta.changes !== 1) {
            const latest = await env.DB.prepare('SELECT state FROM users WHERE id = ?').bind(u.id).first();
            const raw = latest ? latest.state : '';
            return json({ error: 'Synkkonflikt.', state: raw ? JSON.parse(raw) : null, etag: await stateEtag(raw) }, 409);
          }
          return json({ ok: true, etag: await stateEtag(next) });
        }
      }

      // Tar bort state direkt och blockerar gamla token tills Firebase-raderingen hunnit slå igenom.
      if (path === '/account' && req.method === 'DELETE') {
        const u = await userFromRequest(req, env, true);
        if (!u) return json({ error: 'Inte inloggad.' }, 401);
        await env.DB.prepare('UPDATE users SET state = ? WHERE id = ?')
          .bind(JSON.stringify({ deletedAt: Date.now() }), u.id).run();
        await env.DB.prepare('DELETE FROM user_drinks WHERE firebase_uid = ?').bind(u.firebase_uid).run();
        await env.DB.prepare("DELETE FROM suggestions WHERE firebase_uid = ? AND status IN ('new', 'declined')").bind(u.firebase_uid).run();
        // accepterade och publicerade förslag är katalogens historik; de kopplas bara loss från personen
        await env.DB.prepare("UPDATE suggestions SET firebase_uid = '' WHERE firebase_uid = ?").bind(u.firebase_uid).run();
        return json({ ok: true });
      }

      // F2: egna drinkar, en rad per drink. Klientens tidsstämpel avgör; en äldre skrivning ändrar ingenting.
      if (path === '/drinks' && req.method === 'GET') {
        const u = await requireUser(req, env);
        const rows = await env.DB.prepare('SELECT id, drink_json, updated_at FROM user_drinks WHERE firebase_uid = ?')
          .bind(u.firebase_uid).all();
        return json({ drinks: rows.results.map(drinkRow) });
      }
      const drinkPath = /^\/drinks\/([^/]+)$/.exec(path);
      if (drinkPath) {
        const u = await requireUser(req, env), id = drinkPath[1];
        if (!KEBAB.test(id)) throw new HttpError(400, 'Ogiltigt id.');
        const current = () => env.DB.prepare('SELECT id, drink_json, updated_at FROM user_drinks WHERE firebase_uid = ? AND id = ?')
          .bind(u.firebase_uid, id).first();
        if (req.method === 'GET') {
          const row = await current();
          return row ? json(drinkRow(row)) : json({ error: 'Hittades inte.' }, 404);
        }
        if (req.method === 'PUT' || req.method === 'DELETE') {
          let drink = null, at = Number(url.searchParams.get('updatedAt'));
          if (req.method === 'PUT') {
            const body = await readJson(req, 16384);
            drink = body && body.drink;
            at = body && body.updatedAt;
            if (drinkErrors(drink).length || drink.id !== id) throw new HttpError(400, 'Ogiltig drink.');
            const count = await env.DB.prepare('SELECT COUNT(*) AS n FROM user_drinks WHERE firebase_uid = ? AND drink_json IS NOT NULL AND id != ?')
              .bind(u.firebase_uid, id).first();
            if (count.n >= MAX_DRINKS) throw new HttpError(413, 'Max 100 egna drinkar.');
          }
          if (!Number.isSafeInteger(at) || at <= 0) throw new HttpError(400, 'Ogiltig tidsstämpel.');
          const result = await env.DB.prepare(`INSERT INTO user_drinks (id, firebase_uid, drink_json, updated_at) VALUES (?, ?, ?, ?)
            ON CONFLICT(firebase_uid, id) DO UPDATE SET drink_json = excluded.drink_json, updated_at = excluded.updated_at
            WHERE excluded.updated_at > user_drinks.updated_at`)
            .bind(id, u.firebase_uid, drink ? JSON.stringify(drink) : null, at).run();
          if (!result.meta || result.meta.changes !== 1) return json(Object.assign({ error: 'Nyare version finns.' }, drinkRow(await current())), 409);
          return json({ ok: true, updatedAt: at });
        }
      }

      // F3: förslag till katalogen
      if (path === '/suggestions' && req.method === 'POST') {
        const u = await requireUser(req, env);
        const s = await readJson(req, 16384);
        if (!s || s.consent !== true || !['variant', 'new'].includes(s.kind) || drinkErrors(s.drink).length ||
          !(s.similarTo === undefined || s.similarTo === null || (typeof s.similarTo === 'string' && KEBAB.test(s.similarTo))) ||
          !optText(s.source, 200) || !optText(s.displayName, 60)) throw new HttpError(400, 'Ogiltigt förslag.');
        const now = Date.now();
        const recent = await env.DB.prepare('SELECT COUNT(*) AS n FROM suggestions WHERE firebase_uid = ? AND created_at > ?')
          .bind(u.firebase_uid, now - DAY).first();
        if (recent.n >= SUGGESTIONS_PER_DAY) throw new HttpError(429, 'Max fem förslag per dygn.');
        const payload = { drink: s.drink, kind: s.kind, similarTo: s.similarTo || null,
          source: s.source || null, displayName: s.displayName || null, consentAt: now };
        const result = await env.DB.prepare('INSERT INTO suggestions (firebase_uid, payload, created_at) VALUES (?, ?, ?)')
          .bind(u.firebase_uid, JSON.stringify(payload), now).run();
        return json({ id: result.meta.last_row_id, status: 'new' }, 201);
      }
      if (path === '/suggestions/mine' && req.method === 'GET') {
        const u = await requireUser(req, env);
        const rows = await env.DB.prepare(`SELECT id, status, note, drink_id, created_at, reviewed_at,
          json_extract(payload, '$.drink.id') AS custom_id FROM suggestions WHERE firebase_uid = ? ORDER BY id`)
          .bind(u.firebase_uid).all();
        return json({ suggestions: rows.results });
      }
      if (path.startsWith('/admin/')) {
        if (!(await isAdmin(req, env))) throw new HttpError(401, 'Fel admin-nyckel.');
        if (path === '/admin/suggestions' && req.method === 'GET') {
          const rows = await env.DB.prepare('SELECT * FROM suggestions WHERE status = ? ORDER BY id LIMIT 100')
            .bind(url.searchParams.get('status') || 'new').all();
          return json({ suggestions: rows.results.map(suggestionRow) });
        }
        const adminPath = /^\/admin\/suggestions\/(\d+)$/.exec(path);
        if (adminPath && req.method === 'POST') {
          const b = await readJson(req, 4096);
          if (!b || !['accepted', 'published', 'declined'].includes(b.status) || !optText(b.note, 500) ||
            (b.status === 'published' && !(typeof b.drink_id === 'string' && KEBAB.test(b.drink_id)))) throw new HttpError(400, 'Ogiltig status.');
          const result = await env.DB.prepare('UPDATE suggestions SET status = ?, note = ?, drink_id = ?, reviewed_at = ? WHERE id = ?')
            .bind(b.status, b.note || null, b.status === 'published' ? b.drink_id : null, Date.now(), Number(adminPath[1])).run();
          if (!result.meta || result.meta.changes !== 1) throw new HttpError(404, 'Hittades inte.');
          return json({ ok: true });
        }
      }
    } catch (e) {
      if (e instanceof HttpError) return json({ error: e.message }, e.status);
      return json({ error: 'Serverfel.' }, 500);
    }
    return json({ error: 'Hittades inte.' }, 404);
  },
  async scheduled(controller, env) {
    const cutoff = Date.now() - 2 * 60 * 60 * 1000;
    await env.DB.prepare(`
      DELETE FROM users
      WHERE CASE WHEN json_valid(state) THEN json_extract(state, '$.deletedAt') END < ?
    `).bind(cutoff).run();
  },
};
