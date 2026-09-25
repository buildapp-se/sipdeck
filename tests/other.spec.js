const { test, expect } = require('@playwright/test');

// fas 4 (övrigt): pantry, settings, account form, bottom nav and page changes
async function seed(page, state) {
  await page.addInitScript(s => {
    if (!sessionStorage.getItem('seeded')) {
      sessionStorage.setItem('seeded', '1');
      localStorage.setItem('sipdeck', JSON.stringify(s));
    }
  }, Object.assign({ v: 1, favorites: [], pantry: [], settings: { lang: 'sv' } }, state));
}

test('pantry: search filters in place, count is live, almost-there comes first', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await seed(page, {});
  await page.goto('/#/skafferi');
  await expect(page.locator('#pantryCount')).toHaveText('Du kan blanda 0 drinkar');
  await expect(page.locator('#pantryAlmost')).toBeEmpty(); // an empty pantry is not "almost" anything

  const gin = page.locator('[data-pantry="gin"]');
  await gin.check();
  await expect(gin).toBeFocused(); // the list is patched, never re-rendered
  await expect(page.locator('.pantry-almost-row').first()).toBeVisible();
  const almostTop = await page.locator('#pantryAlmost').boundingBox();
  const groupTop = await page.locator('.pantry-group').first().boundingBox();
  expect(almostTop.y).toBeLessThan(groupTop.y);

  // the most used ingredient leads each group
  const leaders = await page.evaluate(async () => {
    const db = await (await fetch('drinks.json')).json();
    const counts = {};
    db.drinks.forEach(d => new Set(d.ingredients.map(l => l.id)).forEach(id => { counts[id] = (counts[id] || 0) + 1; }));
    return Array.from(document.querySelectorAll('.pantry-group')).map(g => {
      const ids = Array.from(g.querySelectorAll('[data-pantry]')).map(i => i.dataset.pantry);
      return counts[ids[0]] === Math.max(...ids.map(id => counts[id]));
    });
  });
  expect(leaders.every(Boolean)).toBe(true);

  await page.locator('#pantrySearch').fill('lime');
  const shown = page.locator('.pantry-item:visible');
  expect(await shown.count()).toBeGreaterThan(0);
  for (const text of await shown.allTextContents()) expect(text.toLowerCase()).toContain('lime');
  await page.locator('#pantrySearch').fill('xyzzy');
  await expect(page.locator('#pantryNoHits')).toBeVisible();
  await expect(page.locator('.pantry-group:visible')).toHaveCount(0);
});

test('pantry: almost-there shows its count and "show all" wraps the cards downwards', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seed(page, { pantry: ['gin', 'lime-juice', 'triple-sec', 'campari', 'white-rum', 'lemon-juice', 'soda-water'] });
  await page.goto('/#/skafferi');
  const title = page.locator('#pantryAlmost .pantry-almost-title'), more = page.locator('[data-almost-all]');
  await expect(title).toHaveText(/^Nästan klart · \d+$/);
  const n = Number((await title.textContent()).split('· ')[1]);
  expect(n).toBeGreaterThan(2);
  await expect(more).toHaveText('Visa alla');
  const rows = page.locator('.pantry-almost-row');
  expect((await rows.nth(1).boundingBox()).y).toBe((await rows.nth(0).boundingBox()).y); // one sideways row

  await more.click();
  await expect(more).toHaveText('Visa färre');
  await expect(more).toHaveAttribute('aria-expanded', 'true');
  await expect(more).toBeFocused();
  const [a, b, c] = [await rows.nth(0).boundingBox(), await rows.nth(1).boundingBox(), await rows.nth(2).boundingBox()];
  expect(b.y).toBe(a.y); // two side by side at 390 px ...
  expect(c.y).toBeGreaterThan(a.y + a.height - 1); // ... then the next row down
  expect(c.x).toBe(a.x);
  const last = await rows.nth(n - 1).boundingBox();
  expect(last.x + last.width).toBeLessThanOrEqual(390); // nothing runs off to the right any more

  await page.locator('[data-pantry="gin"]').click(); // checking an item keeps the expanded list
  await expect(page.locator('.pantry-almost-list.all')).toHaveCount(1);
});

test('settings: folded account first, unit, wheel extras; login, register and forgot modes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await seed(page, { settings: { lang: 'en', unit: 'cl' } });
  await page.goto('/#/installningar');
  await page.locator('[data-unit-setting="oz"]').click();
  await expect(page.locator('[data-unit-setting="oz"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-unit-setting="oz"]')).toBeFocused();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('sipdeck')).settings.unit)).toBe('oz');

  const account = page.locator('details#account');
  await expect(account).not.toHaveAttribute('open', '');
  await expect(account.locator('summary')).toContainText('Sync between devices');
  const langTop = (await page.locator('[data-lang="en"]').boundingBox()).y;
  expect((await account.boundingBox()).y).toBeLessThan(langTop);

  // shots start on, beer and wine off; all three are toggles
  const wine = page.locator('[data-wheel-extra="wine"]');
  await expect(page.locator('[data-wheel-extra="shot"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-wheel-extra][aria-pressed="false"]')).toHaveCount(2);
  await wine.click();
  await expect(wine).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('sipdeck')).settings.wheelExtras)).toEqual(['shot', 'wine']);

  await account.locator('summary').click();
  const submit = page.locator('#emailForm [type="submit"]');
  await expect(submit).toHaveCount(1);
  await expect(submit).toHaveText('Log in');
  await expect(page.locator('#accPw')).toHaveAttribute('autocomplete', 'current-password');
  await page.locator('#accEmail').fill('a@example.com');
  await page.locator('[data-acc-mode="register"]').click();
  await expect(page.locator('[data-acc-mode="register"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(submit).toHaveText('Create account');
  await expect(page.locator('#accPw')).toHaveAttribute('autocomplete', 'new-password');
  await expect(page.locator('#accEmail')).toHaveValue('a@example.com');

  await page.locator('[data-acc-mode="login"]').click();
  await page.locator('[data-acc-mode="forgot"]').click();
  await expect(page.locator('#forgotForm')).toBeVisible();
  await expect(page.locator('#accPw')).toHaveCount(0);
  await expect(page.locator('#accEmail')).toHaveValue('a@example.com');
  await page.locator('#forgotForm [data-acc-mode="login"]').click();
  await expect(page.locator('#emailForm')).toBeVisible();

  await page.locator('[data-lang="sv"]').click(); // a re-render keeps the account open
  await expect(account).toHaveAttribute('open', '');
});

test('bottom nav: centred, at most 640 px wide, 12 px labels', async ({ page }) => {
  await seed(page, {});
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  const box = await page.locator('#nav').boundingBox();
  expect(box.width).toBe(640);
  expect(Math.abs(box.x + box.width / 2 - 640)).toBeLessThan(1);
  expect(await page.locator('#nav a').first().evaluate(a => getComputedStyle(a).fontSize)).toBe('12px');
});

test('page change animates #view on a route change only, never for the wheel', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await seed(page, {});
  await page.addInitScript(() => {
    window.viewAnims = 0;
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (...args) {
      if (this.id === 'view') window.viewAnims++;
      return animate.apply(this, args);
    };
  });
  const anims = () => page.evaluate(() => window.viewAnims);
  await page.goto('/');
  await expect(page.locator('#deck .card[data-depth="0"]')).toBeVisible();
  expect(await anims()).toBe(0);

  await page.locator('#nav a[href="#/skafferi"]').click();
  await expect(page.locator('#pantryCount')).toBeVisible();
  expect(await anims()).toBe(1);
  await page.locator('[data-pantry="gin"]').check(); // within the route: no page change
  await page.locator('#nav a[href="#/"]').click();
  await expect(page.locator('#deck .card[data-depth="0"]')).toBeVisible();
  expect(await anims()).toBe(2);

  await expect(page.locator('#wheelEntry')).toHaveAttribute('aria-disabled', 'false');
  await page.locator('#wheelEntry').click();
  await expect(page.locator('#wheelLayer .wheel-screen')).toBeVisible();
  await page.locator('[data-wheel-act="back"]').click();
  await expect(page.locator('#wheelLayer')).toBeHidden();
  expect(await anims()).toBe(2);
});

for (const width of [390, 430]) {
  test(`deck chips line up with the card and the base chip opens its list at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await seed(page, {});
    await page.goto('/#/');
    const deck = await page.locator('#deck').boundingBox();
    const chips = page.locator('.fchips > .fchip');
    const first = await chips.first().boundingBox(), last = await chips.last().boundingBox();
    expect(Math.abs(first.x - deck.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(last.x + last.width - (deck.x + deck.width))).toBeLessThanOrEqual(1);
    // the chip's enlarged tap area must not sit on top of the invisible <select>
    const hit = await page.locator('select[data-filter="base"]').evaluate(el => {
      const r = el.getBoundingClientRect();
      return document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) === el;
    });
    expect(hit).toBe(true);
    await page.locator('select[data-filter="base"]').selectOption('gin');
    await expect(page.locator('[data-chip="all"] .amount')).toHaveText('19');
  });
}
