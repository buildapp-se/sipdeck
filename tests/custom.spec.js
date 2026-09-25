const { test, expect } = require('@playwright/test');

// F2 own drinks and F3 suggestions. Signed-in runs replace the Firebase modules and the API with
// page.route stubs, so no request leaves the machine and the real client code does the talking.
async function seed(page, state, custom) {
  await page.addInitScript(([s, c]) => {
    if (!sessionStorage.getItem('seeded')) {
      sessionStorage.setItem('seeded', '1');
      localStorage.setItem('sipdeck', JSON.stringify(s));
      if (c) localStorage.setItem('sipdeck.custom', JSON.stringify(c));
    }
  }, [Object.assign({ v: 1, favorites: [], pantry: [], settings: { lang: 'sv' } }, state), custom || null]);
}

const own = (id, name, ingredients) => ({ id, updatedAt: 1, drink: { id, custom: true, name, glass: 'rocks', color: 'amber', bar: false, tags: [],
  ingredients, method: { en: 'Rör och sila.' } } });

async function signIn(page, api) {
  await page.addInitScript(() => localStorage.setItem('sipdeck-auth', '1'));
  const js = body => ({ contentType: 'application/javascript', headers: { 'Access-Control-Allow-Origin': '*' }, body });
  await page.route('https://www.gstatic.com/firebasejs/**/firebase-app.js', r => r.fulfill(js('export const initializeApp = () => ({});')));
  await page.route('https://www.gstatic.com/firebasejs/**/firebase-auth.js', r => r.fulfill(js(`
    const user = { uid: 'u1', email: 'test@example.com', providerData: [{ providerId: 'password' }], getIdToken: async () => 'a.b.c' };
    export const getAuth = () => ({});
    export const onAuthStateChanged = (auth, cb) => setTimeout(() => cb(user), 0);`)));
  await page.route('https://sipdeck-api.sipdeck.workers.dev/**', async route => {
    const req = route.request(), path = new URL(req.url()).pathname;
    api.calls.push(req.method() + ' ' + path);
    const reply = (data, status = 200) => route.fulfill({ status, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(data) });
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' } });
    if (path === '/state') return reply(req.method() === 'GET' ? { state: null, etag: 'e0' } : { ok: true, etag: 'e1' });
    if (path === '/drinks') return reply({ drinks: api.remote || [] });
    if (path.startsWith('/drinks/')) { api.puts.push(req.postDataJSON()); return reply({ ok: true }); }
    if (path === '/suggestions/mine') return reply({ suggestions: api.mine });
    if (path === '/suggestions') {
      const body = req.postDataJSON();
      api.posted = body;
      api.mine = [{ id: 1, status: 'new', custom_id: body.drink.id }];
      return reply({ id: 1, status: 'new' }, 201);
    }
    return reply({ error: 'x' }, 404);
  });
}

test('own drink: create, list as Egen, deck and search, edit, delete with undo, stored outside the state blob', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await seed(page, {});
  await page.goto('/#/favoriter');
  await expect(page.getByRole('heading', { name: 'Mina drinkar' })).toBeVisible();
  await page.getByRole('link', { name: '+ Ny drink' }).click();
  await expect(page.locator('h1')).toHaveText('Ny drink');

  const form = page.locator('#customForm');
  await form.getByLabel('Namn').fill('Kvällens sour');
  await form.locator('.pick', { hasText: 'rocksglas' }).click();
  await form.getByLabel('Bärnsten').check();
  const lines = form.locator('.custom-line');
  await lines.nth(0).getByLabel('Mängd').fill('5');
  await lines.nth(0).getByLabel('Ingrediens', { exact: true }).fill('Bourbon');
  await lines.nth(1).getByLabel('Mängd').fill('2,5'.replace(',', '.'));
  await lines.nth(1).getByLabel('Ingrediens', { exact: true }).fill('Hemgjord fläderlikör');
  await form.getByRole('button', { name: '+ Lägg till ingrediens' }).click();
  await expect(lines).toHaveCount(3);
  await expect(lines.nth(2).getByLabel('Mängd')).toBeFocused();
  await lines.nth(2).getByRole('button', { name: 'Ta bort ingrediens' }).click();
  await expect(lines).toHaveCount(2);
  await form.getByLabel('Gör så här').fill('Skaka med is och sila.');
  await form.getByRole('button', { name: 'Spara i Mina drinkar' }).click();

  // lands on the detail of the new drink
  await expect(page.locator('.fav-detail .card-name')).toHaveText('Kvällens sour');
  await expect(page.locator('.fav-detail .card-meta')).toHaveText('rocksglas');
  await expect(page.locator('.fav-ing-row').nth(0)).toContainText('5 cl');
  await expect(page.locator('.fav-ing-row').nth(1)).toContainText('Hemgjord fläderlikör');
  const stored = await page.evaluate(() => ({ custom: JSON.parse(localStorage.getItem('sipdeck.custom')), state: localStorage.getItem('sipdeck') }));
  expect(stored.custom).toHaveLength(1);
  const id = stored.custom[0].id;
  expect(id).toMatch(/^egen-[a-z0-9]+$/);
  expect(stored.custom[0].drink.ingredients.map(l => l.id)).toEqual(['bourbon', 'hemgjord-fladerlikor']);
  expect(stored.state).not.toContain('Kvällens');

  // listed under Mina drinkar, marked Egen
  await page.getByRole('button', { name: 'Tillbaka' }).click();
  const row = page.locator('.fav-row', { hasText: 'Kvällens sour' });
  await expect(row.locator('.meta')).toHaveText('Egen');

  // edit keeps the id and pre-fills the form
  await row.locator('.fav-open').click();
  await page.getByRole('link', { name: 'Redigera' }).click();
  await expect(page.locator('h1')).toHaveText('Redigera drink');
  await expect(page.getByLabel('Namn')).toHaveValue('Kvällens sour');
  await expect(page.locator('.custom-line').nth(0).getByLabel('Mängd')).toHaveValue('5');
  await expect(page.getByLabel('Bärnsten')).toBeChecked();
  await page.getByLabel('Namn').fill('Nattens sour');
  await page.getByRole('button', { name: 'Spara i Mina drinkar' }).click();
  await expect(page.locator('.fav-detail .card-name')).toHaveText('Nattens sour');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('sipdeck.custom')).map(e => e.id))).toEqual([id]);

  // search finds it, marked Egen
  await page.goto('/#/sok');
  await page.locator('#searchInput').fill('nattens');
  await expect(page.locator('#searchResults .meta')).toHaveText('Egen');

  // delete from the detail, undo brings it back
  await page.goto('/#/favoriter/' + id);
  await page.getByRole('button', { name: 'Radera' }).click();
  await expect(page.locator('#toast')).toContainText('Raderad');
  await expect(page.locator('.fav-row', { hasText: 'Nattens sour' })).toHaveCount(0);
  await page.locator('#toast button').click();
  await expect(page.locator('.fav-row', { hasText: 'Nattens sour' })).toBeVisible();
});

test('own drink: the deck deals it with the Egen chip and a glass silhouette', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await seed(page, {}, [own('egen-deck', 'Husets drink', [{ id: 'gin', ml: 50, essential: true }])]);
  await page.goto('/');
  await expect(page.locator('.card[data-depth="0"]')).toBeVisible();
  const found = await page.evaluate(async () => {
    for (let i = 0; i < 120; i++) {
      const top = document.querySelector('.card[data-depth="0"]');
      if (top.dataset.id === 'egen-deck') return { chip: top.querySelector('.custom-chip').textContent, img: !!top.querySelector('img'), ph: !!top.querySelector('.glass-rocks') };
      document.querySelector('.deck-skip').click();
      await new Promise(r => setTimeout(r, 20));
    }
    return null;
  });
  expect(found).toEqual({ chip: 'Egen', img: false, ph: true });
  const db = await (await page.request.get('/drinks.json')).json();
  const cards = new Set(db.drinks.map(d => d.family || d.id)).size; // one card per family
  await expect(page.locator('.fchip[data-chip="all"] .amount')).toHaveText(String(cards + 1));
});

test('suggest: signed out asks for an account', async ({ page }) => {
  await seed(page, {}, [own('egen-s', 'Min sour', [{ id: 'gin', ml: 50, essential: true }])]);
  await page.goto('/#/favoriter/egen-s');
  await page.getByRole('link', { name: 'Föreslå till Sipdeck' }).click();
  await expect(page.locator('h1')).toHaveText('Föreslå till Sipdeck');
  await expect(page.getByRole('link', { name: 'Logga in under Inställningar' })).toBeVisible();
  await expect(page.locator('#suggestForm')).toHaveCount(0);
});

test('suggest: signed in, similarity choice, required consent, status afterwards; own drinks sync per drink', async ({ page }) => {
  const api = { calls: [], puts: [], mine: [], remote: [{ id: 'egen-remote', updatedAt: 5, drink: own('egen-remote', 'Från telefonen', [{ id: 'gin', ml: 40, essential: true }]).drink }] };
  await signIn(page, api);
  // whiskey sour's essential ids plus one more: similar enough to ask variant or new
  const ws = await (await page.request.get('/drinks.json')).json();
  const sour = ws.drinks.find(d => d.id === 'whiskey-sour');
  const lines = sour.ingredients.filter(l => l.essential).concat({ id: 'elderflower-cordial', ml: 10, essential: true });
  await seed(page, {}, [own('egen-w', 'Fläder sour', lines)]);
  await page.goto('/#/foresla/egen-w');

  // the sign-in pull merged the remote drink and pushed the local one
  await expect(page.locator('#suggestForm')).toBeVisible();
  // the pull runs after sign-in, so it can finish after the form shows: wait for it, don't sample once
  await expect.poll(() => api.puts.map(p => p.drink.id)).toEqual(['egen-w']);
  expect(api.calls).toContain('GET /drinks');
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('sipdeck.custom')).map(e => e.id).sort())).toEqual(['egen-remote', 'egen-w']);

  const box = page.locator('.suggest-similar');
  await expect(box).toContainText('Liknar något som redan finns');
  await expect(box).toContainText(sour.name);
  const n = lines.length - 1;
  await expect(box).toContainText(`${n} av ${n + 1} ingredienser gemensamma`);

  const send = page.getByRole('button', { name: 'Skicka förslag' });
  await send.click();
  expect(api.posted).toBeUndefined(); // kind and consent are required
  // after the empty submit, headless Firefox's native "select one" bubble sits over the label now and then
  // and eats pointer clicks (CI run 36159471345); check the radio itself. Clicking a .pick label is covered
  // by the own-drink test ('rocksglas'), which has no empty submit before it
  await box.locator('.pick', { hasText: 'Som variant' }).locator('input').check({ force: true });
  await send.click();
  expect(api.posted).toBeUndefined();
  await page.getByLabel('Visningsnamn om den publiceras (valfritt)').fill('Patrik');
  await page.getByLabel('Jag godkänner att Sipdeck får publicera, redigera och illustrera receptet.').check();
  // a background render (the sign-in sync finishing late, CI Firefox) must keep what was filled in
  await page.evaluate(() => window.dispatchEvent(new HashChangeEvent('hashchange')));
  await expect(box.locator('.pick', { hasText: 'Som variant' }).locator('input')).toBeChecked();
  await expect(page.getByLabel('Visningsnamn om den publiceras (valfritt)')).toHaveValue('Patrik');
  await send.click();
  await expect(page.locator('.suggest-status')).toContainText('Skickad');
  expect(api.posted).toMatchObject({ kind: 'variant', similarTo: 'whiskey-sour', displayName: 'Patrik', consent: true, drink: { id: 'egen-w' } });

  await page.goto('/#/favoriter');
  await expect(page.locator('.fav-row', { hasText: 'Fläder sour' }).locator('.meta')).toHaveText('Egen · Skickad');
});
