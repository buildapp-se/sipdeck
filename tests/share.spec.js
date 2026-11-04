const { test, expect } = require('@playwright/test');
const { shareCode, sharedDrink } = require('../app.js');

async function seed(page, { share = true } = {}) {
  await page.addInitScript(share => {
    localStorage.setItem('sipdeck', JSON.stringify({ v: 1, favorites: [], pantry: [], settings: { lang: 'sv', unit: 'cl' } }));
    window.shared = [];
    if (share) navigator.share = async data => { window.shared.push(data); };
    else delete Navigator.prototype.share;
    navigator.clipboard.writeText = async text => { window.copied = text; };
  }, share);
}

test('a catalog drink shares its own page with the recipe as text', async ({ page }) => {
  await seed(page);
  await page.goto('/#/drink/margarita');
  await page.locator('.fav-recipe [data-fav-act="inc"]').click();
  await page.locator('[data-share-fav]').click();
  const [data] = await page.evaluate(() => window.shared);
  expect(data.url).toBe(new URL('/drink/margarita/', page.url()).href);
  expect(data.title).toBe('Margarita');
  expect(data.text).toContain('2 portioner');
  expect(data.text).toContain('10 cl Blanco-tequila');
});

test('without a share sheet the text and link are copied', async ({ page }) => {
  await seed(page, { share: false });
  await page.goto('/#/drink/negroni');
  const button = page.locator('[data-share-fav]');
  await expect(button).toHaveText('Dela');
  await button.click();
  await expect(button).toHaveText('Kopierat!');
  const copied = await page.evaluate(() => window.copied);
  expect(copied.startsWith('Negroni\n')).toBe(true);
  expect(copied.endsWith('\n\n' + new URL('/drink/negroni/', page.url()).href)).toBe(true);
});

test('a shared own drink opens the form filled in, saves as new and can be shared on', async ({ page }) => {
  await seed(page);
  const code = shareCode({ name: 'Mormors fläder', glass: 'highball', color: 'citrus', method: { en: 'Bygg på is.' }, source: { label: 'Mormor' },
    ingredients: [{ ml: 40, label: 'Gin' }, { ml: 20, label: 'Mormors flädersaft' }, { qty: 1, unit: 'top', label: 'Sodavatten' }] }, l => l.label);
  await page.goto('/#/egen/dela/' + code);
  await expect(page.locator('.shared-hint')).toHaveText('Någon har delat den här drinken med dig. Kontrollera och spara den i Mina drinkar.');
  await expect(page.locator('.screen-title')).toHaveText('Ny drink');
  const form = page.locator('#customForm');
  await expect(form.locator('[name=name]')).toHaveValue('Mormors fläder');
  await expect(form.locator('[name=glass][value=highball]')).toBeChecked();
  await expect(form.locator('[name=color][value=citrus]')).toBeChecked();
  expect(await form.locator('[name=ing]').evaluateAll(els => els.map(el => el.value))).toEqual(['Gin', 'Mormors flädersaft', 'Sodavatten']);
  await expect(form.locator('[name=amount]').first()).toHaveValue('4');
  await expect(form.locator('[name=method]')).toHaveValue('Bygg på is.');
  await form.locator('.custom-save').click();
  await expect(page).toHaveURL(/#\/favoriter\/egen-/);
  await expect(page.locator('.fav-detail .card-name')).toHaveText('Mormors fläder');
  await expect(page.locator('.fav-ing-row', { hasText: 'Mormors flädersaft' })).toContainText('2 cl');
  await page.locator('[data-share-fav]').click();
  const [data] = await page.evaluate(() => window.shared);
  const again = sharedDrink(data.url.split('#/egen/dela/')[1]);
  expect(again.name).toBe('Mormors fläder');
  expect(again.ingredients.map(l => l.label)).toEqual(['Gin', 'Mormors flädersaft', 'Sodavatten']);
  await page.goBack();
  await expect(page).not.toHaveURL(/dela/); // saving replaced the share link in history
});

test('a broken share link says so and leaves an empty form', async ({ page }) => {
  await seed(page);
  await page.goto('/#/egen/dela/inte-en-drink');
  await expect(page.locator('.shared-hint')).toHaveText('Den delade länken gick inte att läsa.');
  await expect(page.locator('#customForm [name=name]')).toHaveValue('');
});

test('the wheel result shares a cocktail recipe or what the wheel said, and still fits at 390 × 844', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await seed(page);
  await page.goto('/#/hjul');
  for (const mood of [0, 4]) {
    await page.locator(`[data-wheel-mood="${mood}"]`).first().click();
    await page.locator('#wheelHub').click();
    const result = page.locator('#wheelResult');
    await expect(result).toBeVisible({ timeout: 5000 });
    expect(await page.locator('#wheelPanel').evaluate(el => el.getBoundingClientRect().bottom)).toBeLessThanOrEqual(664);
    const share = result.locator('[data-wheel-act="share"]');
    expect((await share.boundingBox()).height).toBeGreaterThanOrEqual(44);
    await share.click();
    const data = await page.evaluate(() => window.shared.pop());
    const recipe = result.locator('.fav-open');
    if (await recipe.count()) expect(data.url).toBe(new URL(`/drink/${await recipe.getAttribute('data-id')}/`, page.url()).href);
    else {
      expect(data.url).toBe(new URL('/', page.url()).href);
      expect(data.text).toBe('Din beställning: ' + await result.locator('.wheel-result-name').textContent());
    }
    await result.locator('[data-wheel-act="change"]').click();
  }
});
