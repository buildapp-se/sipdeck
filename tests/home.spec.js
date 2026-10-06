const { test, expect } = require('@playwright/test');

// ADR 0001 (flaskor/docs/adr/0001-sipdeck-hemma.md): At home, the pantry migration and the optional Flaskor
// link. Signed-in runs replace the Firebase modules, the Sipdeck API and the Flaskor API with page.route
// stubs, so no request leaves the machine and the real client code does the talking.
async function seed(page, state) {
  await page.addInitScript(s => {
    if (!sessionStorage.getItem('seeded')) {
      sessionStorage.setItem('seeded', '1');
      localStorage.setItem('sipdeck', JSON.stringify(s));
    }
  }, Object.assign({ v: 1, favorites: [], pantry: [], settings: { lang: 'sv' } }, state));
}
const stored = page => page.evaluate(() => JSON.parse(localStorage.getItem('sipdeck')));
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' };

const bottle = (id, name, extra) => Object.assign({ id, kind: 'spirit', name, producer: null, category: null, style: null, country: null, region: null, ref: null }, extra);
const BOTTLES = [
  bottle(1, 'Tanqueray No. Ten', { category: 'Gin & Genever', style: 'Gin', ref: 'sb:100' }),
  bottle(2, 'Hernö Gin', { category: 'Gin & Genever', style: 'Gin', ref: 'sb:200' }),
  bottle(3, 'Cointreau', { category: 'Likör', style: 'Fruktlikör', ref: 'sb:300' }),
  bottle(4, 'Plantation 5 Years', { category: 'Rom & Lagrad sockerrörssprit', style: 'Mörk rom & Lagrad sockerrörssprit', ref: 'sb:400' }),
  bottle(5, 'Bollinger Special Cuvée', { kind: 'wine', category: 'Mousserande vin', style: 'Torrt vitt', country: 'Frankrike', region: 'Champagne', ref: 'sb:500' }),
  bottle(6, 'Chablis', { kind: 'wine', category: 'Vitt vin' }),
];

// flaskor.reply decides what the Flaskor API answers; a function gets the call and may hold the answer back
async function signIn(page, flaskor, serverState) {
  await page.addInitScript(() => localStorage.setItem('sipdeck-auth', '1'));
  const js = body => ({ contentType: 'application/javascript', headers: cors, body });
  await page.route('https://www.gstatic.com/firebasejs/**/firebase-app.js', r => r.fulfill(js('export const initializeApp = () => ({});')));
  await page.route('https://www.gstatic.com/firebasejs/**/firebase-auth.js', r => r.fulfill(js(`
    const user = { uid: 'u1', email: 'test@example.com', providerData: [{ providerId: 'password' }], getIdToken: async () => 'sipdeck.id.token' };
    let listener = null;
    export const getAuth = () => ({});
    export const getRedirectResult = async () => null;
    export const onAuthStateChanged = (auth, cb) => { listener = cb; setTimeout(() => cb(user), 0); };
    export const signOut = async () => listener(null);`)));
  const api = { state: serverState || null, puts: [] };
  await page.route('https://sipdeck-api.sipdeck.workers.dev/**', async route => {
    const req = route.request(), path = new URL(req.url()).pathname;
    const reply = (data, status = 200) => route.fulfill({ status, contentType: 'application/json', headers: cors, body: JSON.stringify(data) });
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    if (path === '/state' && req.method() === 'GET') return reply({ state: api.state, etag: 'e' + api.puts.length });
    if (path === '/state') { api.state = req.postDataJSON().state; api.puts.push(api.state); return reply({ ok: true, etag: 'e' + api.puts.length }); }
    if (path === '/drinks') return reply({ drinks: [] });
    if (path === '/suggestions/mine') return reply({ suggestions: [] });
    return reply({ error: 'x' }, 404);
  });
  await page.route('https://flaskor-api.buildapp.se/**', async route => {
    const req = route.request(), call = req.method() + ' ' + new URL(req.url()).pathname;
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    flaskor.calls.push(call);
    flaskor.auth = req.headers().authorization;
    const answer = typeof flaskor.reply === 'function' ? await flaskor.reply(call, req) : flaskor.reply;
    if (answer === 'offline') return route.abort('internetdisconnected');
    return route.fulfill({ status: answer.status || 200, contentType: 'application/json', headers: cors, body: JSON.stringify(answer.body || {}) });
  });
  return api;
}
const linked = { home: { have: ['lime'], seen: [], flaskor: true } };
const snapshot = bottles => ({ body: { contract: 1, household: 'Vinkällaren', bottles } });

test('migration in the browser: an old pantry becomes At home once, loss-free, and old links keep working', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await seed(page, { favorites: ['mojito'], pantry: ['white-rum', 'mint-leaves', 'lime-wheel', 'lime-juice', 'white-sugar', 'soda-water'], settings: { lang: 'sv', unit: 'ml' } });
  await page.goto('/#/skafferi');
  await expect(page.locator('h1')).toHaveText('Hemma');
  await expect(page.locator('#nav a[aria-current="page"]')).toHaveText('Hemma');
  await expect(page.locator('#homeHave .home-row .name')).toHaveText(['Vit rom', 'Lime', 'Limejuice', 'Mynta', 'Sodavatten', 'Vitt socker']);
  const first = await stored(page);
  expect(first.pantry).toHaveLength(6); // the old list is the migration's input and is left alone
  expect(first.favorites).toEqual(['mojito']);
  expect(first.settings.unit).toBe('ml');
  expect(first.home.seen).toEqual(first.pantry);

  await page.reload(); // twice changes nothing
  await expect(page.locator('#homeHave .home-row')).toHaveCount(6);
  expect((await stored(page)).home).toEqual(first.home);

  // mint leaves in the old pantry: the Mojito that asks for sprigs is now makeable
  await page.goto('/#/drink/mojito');
  await expect(page.locator('.fav-ing-row .missing-tag')).toHaveCount(0);
  await page.goto('/#/hemma');
  await page.locator('[data-home-remove="mint"]').click();
  await expect(page.locator('#homeHave .home-row')).toHaveCount(5);
  await page.reload(); // removed At home stays removed although the old pantry still lists it
  await expect(page.locator('#homeHave .home-row')).toHaveCount(5);
  expect((await stored(page)).pantry).toContain('mint-leaves');
});

test('same matching in every view: Cointreau for triple sec, a labelled swap the other way, whole lime against juice', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await seed(page, { favorites: ['margarita', 'cosmopolitan', 'caipirinha'],
    home: { have: ['tequila-blanco', 'lime-juice', 'cointreau', 'cachaca', 'white-sugar'], seen: [] } });
  await page.goto('/#/favoriter');
  const row = name => page.locator('.fav-row', { hasText: name });
  await expect(row('Margarita').locator('.fav-missing')).toHaveCount(0); // Cointreau meets triple sec
  await expect(row('Caipirinha').locator('.fav-missing')).toHaveText('Saknar: Lime'); // juice is not a whole lime
  await row('Margarita').locator('.fav-open').click();
  await expect(page.locator('.fav-ing-row', { hasText: 'Triple sec' })).toContainText('via Cointreau');
  await expect(page.locator('.fav-ing-row .missing-tag')).toHaveCount(0);

  // the other direction: generic triple sec does not count as Cointreau, it is offered as a swap with its reason
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('sipdeck'));
    s.home.have = ['citron-vodka', 'cranberry-juice', 'lime', 'triple-sec'];
    localStorage.setItem('sipdeck', JSON.stringify(s));
  });
  await page.goto('/#/drink/cosmopolitan');
  await page.reload();
  const cointreau = page.locator('.fav-ing-row', { hasText: 'Cointreau' });
  await expect(cointreau.locator('.missing-tag')).toHaveCount(1);
  await expect(cointreau).toContainText('ersätt: Triple sec');
  await expect(page.locator('.fav-recipe .variant-without')).toContainText('Ersättning: Triple sec i stället för Cointreau. Generisk triple sec');
  await expect(page.locator('.fav-ing-row', { hasText: 'Limejuice' }).locator('.missing-tag')).toHaveCount(0); // a whole lime gives juice

  await page.goto('/#/hemma');
  await expect(page.locator('#pantryCount')).toHaveText('Du kan blanda 0 drinkar'); // a swap never counts
  await expect(page.locator('.pantry-almost-row', { hasText: 'Cosmopolitan' })).toContainText('Saknar: Cointreau (ersätt: Triple sec)');
  // the deck's "can make" chip uses the same answer
  await page.goto('/#/');
  await page.locator('[data-chip="makeable"]').click();
  await expect(page.locator('[data-chip="all"] .amount')).toHaveText('0');
});

for (const [lang, width, title, bar, other] of [['sv', 390, 'Hemma', 'Barskåp · 1', 'Övriga ingredienser · 1'], ['en', 1280, 'At home', 'Bar cabinet · 1', 'Other ingredients · 1']]) {
  test(`guest at ${width} px in ${lang}: holdings first, search by product name, browse kept, Flaskor is optional`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await seed(page, { settings: { lang } });
    const requests = [];
    page.on('request', r => { if (!r.url().startsWith('http://127.0.0.1')) requests.push(r.url()); });
    await page.goto('/#/hemma');
    await expect(page.locator('h1')).toHaveText(title);
    await expect(page.locator('#homeHave .home-empty')).toBeVisible();
    await expect(page.locator('#homeAll')).not.toHaveAttribute('open', '');

    await page.locator('[data-home-add]').click();
    await expect(page.locator('#pantrySearch')).toBeFocused();
    await page.locator('#pantrySearch').fill('kahlua'); // a product name finds its ingredient
    await expect(page.locator('.pantry-item:visible')).toHaveCount(1);
    await page.locator('.pantry-item:visible input').check();
    await page.locator('#pantrySearch').fill(lang === 'sv' ? 'citron' : 'lemon'); // the raw ingredient lists what it gives
    await page.locator('[data-pantry="lemon"]').check();
    await expect(page.locator('.pantry-item', { has: page.locator('[data-pantry="lemon"]') }).locator('small')).toContainText(lang === 'sv' ? 'Citronjuice' : 'Lemon juice');
    await expect(page.locator('#pantrySearch')).toHaveValue(lang === 'sv' ? 'citron' : 'lemon'); // nothing was re-rendered

    await expect(page.locator('#homeHave .home-shelf')).toHaveText([bar, other]);
    await expect(page.locator('#homeHave .home-row', { hasText: lang === 'sv' ? 'Citron' : 'Lemon' }).locator('.meta').first())
      .toContainText(lang === 'sv' ? 'Räcker även till: ' : 'Also covers: ');
    expect((await stored(page)).home.have).toEqual(['coffee-liqueur', 'lemon']);
    expect((await page.locator('#homeHave').boundingBox()).y).toBeLessThan((await page.locator('#pantrySearch').boundingBox()).y);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); // no sideways scroll

    await expect(page.locator('#homeFlaskor')).toContainText(lang === 'sv' ? 'Valfritt' : 'Optional');
    await expect(page.locator('#homeFlaskor a')).toHaveAttribute('href', '#/installningar');
    expect(requests).toEqual([]); // no account, no Flaskor: nothing leaves the device
  });
}

test('linked: bottles count next to hand-made marks, uncertain ones wait for a choice, a correction moves one product only', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await seed(page, linked);
  const flaskor = { calls: [], reply: snapshot(BOTTLES) };
  const api = await signIn(page, flaskor, null);
  await page.goto('/#/hemma');
  await expect(page.locator('#homeFlaskor')).toContainText('Kopplat hushåll: Vinkällaren');
  await expect(page.locator('#flaskorStatus')).toContainText('Uppdaterad ');
  expect(flaskor.auth).toBe('Bearer sipdeck.id.token'); // the account's own Sipdeck token, nothing else
  expect(flaskor.calls).toEqual(['GET /api/sipdeck/bottles']);

  const row = name => page.locator('#homeHave .home-row', { hasText: name });
  await expect(row('Gin').locator('.home-src')).toHaveText('Från Flaskor: Tanqueray No. Ten, Hernö Gin'); // two bottles, one ingredient
  await expect(row('Cointreau')).toContainText('Räcker även till: Triple sec');
  await expect(row('Champagne').locator('.home-src')).toContainText('Bollinger'); // wine from the cellar counts
  await expect(row('Gin').locator('[data-home-remove]')).toHaveCount(0); // a Flaskor bottle is not removed here
  await expect(row('Lime').locator('[data-home-remove]')).toHaveCount(1);
  await expect(page.locator('#homeFlaskor .home-sub')).toHaveText('Behöver ditt val · 1'); // the dark rum
  await expect(page.locator('#homeHave')).not.toContainText('Plantation');

  const rum = page.locator('.home-pick', { hasText: 'Plantation' }).first().locator('select');
  await rum.selectOption('jamaican-rum');
  await expect(row('Jamaicansk rom').locator('.home-src')).toContainText('Plantation 5 Years');
  await expect(page.locator('#homeFlaskor .home-sub')).toHaveCount(0);

  // reclassify one gin: only that product moves, the other still gives gin
  await page.locator('#flaskorAll summary').click();
  await expect(page.locator('#flaskorAll .home-pick')).toHaveCount(6); // the white wine is kept, giving nothing
  await page.locator('#flaskorAll .home-pick', { hasText: 'Tanqueray' }).locator('select').selectOption('old-tom-gin');
  await expect(row('Old Tom-gin').locator('.home-src')).toContainText('Tanqueray');
  await expect(row(/^\s*Gin/).locator('.home-src')).toHaveText('Från Flaskor: Hernö Gin');
  expect((await stored(page)).home.picks).toEqual({ 'sb:400': 'jamaican-rum', 'sb:100': 'old-tom-gin' });
  expect((await stored(page)).home.have).toEqual(['lime']); // imported bottles are never written into the marks

  // a hand-made mark on the same ingredient is shown apart from the bottle
  await page.locator('#homeAll summary').click();
  await page.locator('[data-pantry="cointreau"]').check();
  await expect(row('Cointreau')).toContainText('Även tillagd av dig');
  await expect.poll(() => api.puts.length && api.puts.at(-1).home.have).toEqual(['lime', 'cointreau']); // the sync is debounced
  expect(JSON.stringify(api.puts)).not.toContain('Tanqueray'); // no bottle ever enters the synced blob
});

test('last bottle gone, then network failure, then a confirmed revocation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await seed(page, { home: { have: ['gin', 'lime'], seen: [], flaskor: true } });
  const flaskor = { calls: [], reply: snapshot(BOTTLES.slice(0, 3)) };
  await signIn(page, flaskor, null);
  await page.goto('/#/hemma');
  const row = name => page.locator('#homeHave .home-row', { hasText: name });
  await expect(row(/^\s*Gin/).locator('.home-src')).toContainText('Tanqueray');
  const update = page.locator('[data-flaskor="refresh"]');

  flaskor.reply = snapshot(BOTTLES.slice(1, 3)); // one gin bottle finished: still gin
  await update.click();
  await expect(row(/^\s*Gin/).locator('.home-src')).toHaveText('Från Flaskor: Hernö Gin');

  flaskor.reply = snapshot(BOTTLES.slice(2, 3)); // the last one finished: only the hand-made mark is left
  await update.click();
  await expect(row(/^\s*Gin/).locator('.home-src')).toHaveCount(0);
  await expect(row(/^\s*Gin/).locator('[data-home-remove]')).toHaveCount(1);

  flaskor.reply = 'offline'; // a network failure is not an empty cabinet
  await update.click();
  await expect(page.locator('#flaskorStatus')).toContainText('Kunde inte nå Flaskor. Visar det som hämtades');
  await expect(row('Cointreau').locator('.home-src')).toHaveText('Från Flaskor: Cointreau');
  flaskor.reply = { status: 503, body: { error: 'down' } };
  const before = flaskor.calls.length;
  await page.reload(); // still there after a reload, with the time of the last good fetch
  await expect(row('Cointreau').locator('.home-src')).toHaveText('Från Flaskor: Cointreau');
  await expect(page.locator('#flaskorStatus')).toContainText('Uppdaterad ');
  expect(flaskor.calls.length).toBe(before); // inside the cache window opening At home asks nothing
  await update.click(); // the button always asks; a server error is not an empty cabinet either
  await expect(page.locator('#flaskorStatus')).toContainText('Kunde inte nå Flaskor');
  await expect(row('Cointreau')).toHaveCount(1);
  flaskor.reply = { status: 401, body: { error: 'invalid token' } }; // a token problem is not a revocation either
  await update.click();
  await expect(row('Cointreau')).toHaveCount(1);

  flaskor.reply = { status: 403, body: { error: 'link revoked', code: 'revoked' } };
  await update.click();
  await expect(page.locator('#homeFlaskor')).toContainText('Kopplingen till Flaskor är borta. Det du lagt till själv är orört.');
  await expect(row('Cointreau')).toHaveCount(0);
  await expect(page.locator('#homeHave .home-row .name')).toHaveText(['Gin', 'Lime']); // hand-made marks survive
  expect(await page.evaluate(() => localStorage.getItem('sipdeck-flaskor'))).toBeNull(); // the cached bottles are gone
  expect((await stored(page)).home.flaskor).toBe(false);
});

test('disconnecting: an answer still on its way does not bring the link back, and signing out removes the cache', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await seed(page, linked);
  let release;
  const held = new Promise(resolve => { release = resolve; });
  const flaskor = { calls: [], reply: snapshot(BOTTLES) };
  await signIn(page, flaskor, null);
  await page.goto('/#/hemma');
  await expect(page.locator('#homeHave .home-row', { hasText: 'Cointreau' })).toHaveCount(1);

  flaskor.reply = async call => {
    if (call.startsWith('GET')) { await held; return snapshot(BOTTLES); } // the update hangs ...
    return { status: 204 }; // ... while the disconnect goes through
  };
  await page.locator('[data-flaskor="refresh"]').click();
  await expect(page.locator('#flaskorStatus')).toHaveText('Hämtar från Flaskor...');
  await page.locator('[data-flaskor="unlink"]').click();
  await expect(page.locator('#flaskorForm')).toBeVisible();
  await expect(page.locator('#homeHave .home-row .name')).toHaveText(['Lime']);
  release(); // the old answer arrives now, with every bottle in it
  await page.waitForTimeout(300);
  await expect(page.locator('#homeHave .home-row .name')).toHaveText(['Lime']);
  await expect(page.locator('#flaskorForm')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('sipdeck-flaskor'))).toBeNull();
  expect(flaskor.calls).toContain('DELETE /api/sipdeck/link');

  // link again with a code, then sign out: the bottles belong to the account, not to the browser
  flaskor.reply = call => call.startsWith('POST') ? { body: { household: 'Vinkällaren' } } : snapshot(BOTTLES);
  await page.locator('#flaskorForm input').fill('https://buildapp.se/sipdeck/#/hemma/koppla/abcdef0123456789');
  await page.locator('#flaskorForm button').click();
  await expect(page.locator('#homeHave .home-row', { hasText: 'Cointreau' })).toHaveCount(1);
  expect(await page.evaluate(() => localStorage.getItem('sipdeck-flaskor'))).not.toBeNull();
  await page.goto('/#/installningar');
  await page.locator('#account summary').click();
  await page.getByRole('button', { name: 'Logga ut' }).click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('sipdeck-flaskor'))).toBeNull();
  await page.goto('/#/hemma');
  await expect(page.locator('#homeHave .home-row .name')).toHaveText(['Lime']);
});

test('link code in the address: confirmed by the signed-in person, never linked on its own, and taken out of the URL', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await seed(page, {});
  const flaskor = { calls: [], reply: call => call.startsWith('POST') ? { body: { household: 'Vinkällaren' } } : snapshot(BOTTLES) };
  await signIn(page, flaskor, null);
  await page.goto('/#/hemma/koppla/abcdef0123456789abcdef0123456789');
  await expect(page.locator('#homeFlaskor')).toContainText('Koppla Flaskor-hushållet till test@example.com?');
  expect(new URL(page.url()).hash).toBe('#/hemma');
  expect(flaskor.calls).toEqual([]); // nothing is linked until the person says so
  await page.locator('[data-flaskor="link"]').click();
  await expect(page.locator('#homeFlaskor')).toContainText('Kopplat hushåll: Vinkällaren');
  expect(flaskor.calls).toEqual(['POST /api/sipdeck/link', 'GET /api/sipdeck/bottles']);
  expect((await stored(page)).home.flaskor).toBe(true);

  // a code that is used up or too old says so and links nothing
  await page.evaluate(() => { localStorage.removeItem('sipdeck-flaskor'); const s = JSON.parse(localStorage.getItem('sipdeck')); s.home.flaskor = false; localStorage.setItem('sipdeck', JSON.stringify(s)); });
  flaskor.reply = { status: 404, body: { error: 'no such code', code: 'bad_code' } };
  await page.goto('/#/hemma/koppla/00000000000000000000000000000000');
  await page.reload();
  await page.goto('/#/hemma/koppla/00000000000000000000000000000000');
  await page.locator('[data-flaskor="link"]').click();
  await expect(page.locator('#homeFlaskor')).toContainText('Koden gäller inte längre. Skapa en ny i Flaskor.');
});

test('context link from Flaskor, and shopping help with its own country setting', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await seed(page, { favorites: ['margarita', 'cosmopolitan', 'mojito'], settings: { lang: 'en' },
    home: { have: ['tequila-blanco', 'lime', 'citron-vodka', 'cranberry-juice', 'white-rum', 'white-sugar', 'soda-water'], seen: [] } });
  // the link Flaskor builds for a bottle: classified here, with the same rules, signed out
  const link = q => '/#/med/' + encodeURIComponent(new URLSearchParams(q).toString());
  await page.goto(link({ n: 'Cointreau', c: 'Likör', s: 'Fruktlikör', k: 'spirit', ref: 'sb:300' }));
  await expect(page.locator('h1')).toHaveText('Drinks with Cointreau (Cointreau)');
  const names = await page.locator('.fav-row .name').allTextContents();
  expect(names).toContain('Cosmopolitan');
  expect(names).toContain('Margarita'); // Cointreau also meets triple sec
  await expect(page.locator('.fav-row', { hasText: 'Cosmopolitan' }).locator('.fav-missing')).toHaveText('Missing: Cointreau');
  await page.locator('.fav-open', { hasText: 'Margarita' }).click();
  await expect(page.locator('.fav-detail .card-name')).toHaveText('Margarita');
  await page.locator('#favClose').click();
  await expect(page.locator('h1')).toHaveText('Drinks with Cointreau (Cointreau)');

  await page.goto(link({ n: 'Plantation 5 Years', c: 'Rom & Lagrad sockerrörssprit', s: 'Mörk rom & Lagrad sockerrörssprit', k: 'spirit' }));
  await expect(page.locator('#view')).toContainText('Sipdeck cannot tell which ingredient this bottle is. Choose one:');
  await page.getByRole('link', { name: 'Aged rum' }).click();
  await expect(page.locator('h1')).toHaveText('Drinks with Aged rum');
  await page.goto(link({ n: 'Cocchi Americano', c: 'Aperitif', k: 'spirit' }));
  await expect(page.locator('#view')).toContainText('Sipdeck does not know which ingredient this bottle is.'); // kept, not guessed

  // shopping help: what opens a favorite comes first; the product route exists only once Sweden is chosen
  await page.goto('/#/hemma');
  const shop = page.locator('#homeShop');
  await expect(shop.locator('.home-row .name')).toHaveText(['Cointreau', 'Mint', 'Triple sec']);
  await expect(shop.locator('.home-row', { hasText: 'Mint' })).toContainText('Opens Mojito');
  await expect(shop.locator('a')).toHaveCount(0); // English says nothing about where you shop
  await shop.locator('[data-country="SE"]').click();
  await expect(shop.locator('[data-country="SE"]')).toBeFocused();
  const pick = shop.locator('.home-row', { hasText: 'Cointreau' }).locator('a');
  await expect(pick).toHaveText('Choose product');
  expect(await pick.getAttribute('href')).toBe('https://buildapp.se/flaskor/#/lagg-till?q=Cointreau'); // a search to choose from, never a set product
  await expect(shop.locator('.home-row', { hasText: 'Mint' }).locator('a')).toHaveCount(0); // not sold at Systembolaget
  expect((await stored(page)).home.country).toBe('SE');
  expect((await stored(page)).settings.lang).toBe('en');
});
