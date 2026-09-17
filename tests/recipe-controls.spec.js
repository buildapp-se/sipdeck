const { test, expect } = require('@playwright/test');

async function seed(page, lang, unit = 'cl') {
  await page.addInitScript(({ lang, unit }) => {
    localStorage.setItem('sipdeck', JSON.stringify({
      v: 1, favorites: [], pantry: [], settings: { lang, unit },
    }));
  }, { lang, unit });
}

async function controlsFit(controls, boundary) {
  const outer = await boundary.boundingBox();
  for (const button of await controls.locator('button, input').all()) {
    const box = await button.boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(outer.x - 1);
    expect(box.x + box.width).toBeLessThanOrEqual(outer.x + outer.width + 1);
    expect(box.y + box.height).toBeLessThanOrEqual(outer.y + outer.height + 1);
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
}

for (const width of [320, 375, 390]) {
  for (const lang of ['sv', 'en']) {
    test(`${lang} recipe controls fit at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 667 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await seed(page, lang);
      await page.route('**/drinks.json', async route => {
        const data = require('../drinks.json');
        await route.fulfill({ json: { ...data, drinks: data.drinks.filter(drink => ['zombie', 'tinto-de-verano'].includes(drink.id)) } });
      });
      await page.goto('/');
      const card = page.locator('.card[data-depth="0"]');
      await card.click();
      await expect(card).toHaveClass(/flipped/);
      await expect(card.locator('.units button')).toHaveText(lang === 'sv' ? ['cl', 'ml'] : ['cl', 'ml', 'oz']);
      await expect.poll(async () => {
        const inner = await card.locator('.card-back').boundingBox();
        const outer = await card.boundingBox();
        return Math.abs(inner.width - outer.width);
      }).toBeLessThan(1);
      await controlsFit(card.locator('.card-ctrl'), card.locator('.card-back'));
      await card.locator('[data-unit="ml"]').click();
      await expect(card.locator('[data-unit="ml"]')).toHaveAttribute('aria-pressed', 'true');

      await page.goto('/#/drink/tinto-de-verano');
      await expect(page.locator('.fav-detail .card-name')).toHaveText('Tinto de verano');
      const recipe = page.locator('.fav-recipe');
      await expect(recipe.locator('.units button')).toHaveText(lang === 'sv' ? ['cl', 'ml'] : ['cl', 'ml', 'oz']);
      await controlsFit(recipe.locator('.fav-recipe-controls'), recipe);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await expect(recipe.locator('.amount', { hasText: '80 ml' })).toHaveCount(3);
      await recipe.locator('[data-unit="cl"]').click();
      await expect(recipe.locator('.amount', { hasText: '8 cl' })).toHaveCount(3);
      await recipe.locator('[data-fav-act="inc"]').click();
      await expect(recipe.locator('.amount', { hasText: '16 cl' })).toHaveCount(3);
      await expect.poll(() => page.locator('.cocktail-art').evaluate(img => img.complete && img.naturalWidth === 640)).toBe(true);
    });
  }
}

test('Swedish recipes and copied text use cl when oz was saved, English retains oz', async ({ page }) => {
  await seed(page, 'sv', 'oz');
  await page.goto('/#/drink/tinto-de-verano');
  await expect(page.locator('.units button')).toHaveText(['cl', 'ml']);
  await expect(page.locator('.units button.active')).toHaveText('cl');
  await expect(page.locator('.fav-ing-row .amount', { hasText: '8 cl' })).toHaveCount(3);
  await page.evaluate(() => {
    navigator.clipboard.writeText = async text => { window.copiedRecipe = text; };
  });
  await page.locator('[data-copy-fav]').click();
  const copied = await page.evaluate(() => window.copiedRecipe);
  expect(copied).toContain('8 cl');
  expect(copied).not.toContain('oz');
  await page.goto('/#/installningar');
  await page.locator('[data-lang="en"]').click();
  await page.evaluate(() => { location.hash = '#/drink/tinto-de-verano'; });
  await expect(page.locator('.units button')).toHaveText(['cl', 'ml', 'oz']);
  await expect(page.locator('.units button.active')).toHaveText('oz');
});

test.describe('touch gestures on a long recipe', () => {
  test.use({ hasTouch: true });
  test('vertical scrolling keeps the card open; horizontal swipe still saves it', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Touch input uses Chromium CDP.');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await seed(page, 'en');
    await page.route('**/drinks.json', async route => {
      const data = require('../drinks.json');
      await route.fulfill({ json: { ...data, drinks: data.drinks.filter(drink => drink.id === 'zombie') } });
    });
    await page.goto('/');
    const card = page.locator('.card[data-depth="0"]');
    await card.tap();
    await expect(card).toHaveClass(/flipped/);
    const recipe = card.locator('.card-recipe');
    const box = await recipe.boundingBox();
    const cdp = await page.context().newCDPSession(page);
    async function drag(x, y, dx, dy) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
      for (let step = 1; step <= 10; step++) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx * step / 10, y: y + dy * step / 10 }] });
      }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    }
    await drag(box.x + box.width / 2, box.y + box.height - 10, 0, -100);
    await expect.poll(() => recipe.evaluate(el => el.scrollTop)).toBeGreaterThan(20);
    await expect(card).toHaveClass(/flipped/);
    await controlsFit(card.locator('.card-ctrl'), card.locator('.card-back'));
    await recipe.evaluate(el => new Promise(resolve => {
      let last = el.scrollTop, stable = 0;
      function frame() {
        stable = el.scrollTop === last ? stable + 1 : 0;
        last = el.scrollTop;
        if (stable >= 10) resolve();
        else requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }));
    await drag(box.x + 100, box.y + 30, 180, 0);
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('sipdeck')).favorites)).toContain('zombie');
  });
});
