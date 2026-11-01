const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('seeded')) {
      sessionStorage.setItem('seeded', '1');
      localStorage.setItem('sipdeck', JSON.stringify({ v: 1, favorites: [], pantry: [], settings: { lang: 'sv' } }));
    }
  });
});

const favorites = page => page.evaluate(() => JSON.parse(localStorage.getItem('sipdeck')).favorites);

test('save button saves, counts and can be undone back onto the top', async ({ page }) => {
  await page.goto('/');
  const top = page.locator('#deck .card[data-depth="0"]');
  const id = await top.getAttribute('data-id');
  await page.locator('[data-deck="1"]').click();
  await expect.poll(() => favorites(page)).toEqual([id]);
  await expect(page.locator('#nav .nav-count')).toHaveText('1');
  await expect(page.locator('#toast')).toBeVisible();
  await page.locator('#toast button').click();
  await expect.poll(() => favorites(page)).toEqual([]);
  await expect(page.locator('#nav .nav-count')).toHaveCount(0);
  await expect(page.locator('#deck .card[data-depth="0"]')).toHaveAttribute('data-id', id);
});

test('skip button moves on without saving', async ({ page }) => {
  await page.goto('/');
  const id = await page.locator('#deck .card[data-depth="0"]').getAttribute('data-id');
  await page.locator('[data-deck="-1"]').click();
  await expect(page.locator('#deck .card[data-depth="0"]')).not.toHaveAttribute('data-id', id);
  expect(await favorites(page)).toEqual([]);
});

test('flip hint disappears for good after the first flip', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.flip-hint').first()).toBeVisible();
  await page.locator('#deck .card[data-depth="0"]').click();
  await expect(page.locator('.flip-hint')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('#deck .card[data-depth="0"]')).toBeVisible();
  await expect(page.locator('.flip-hint')).toHaveCount(0);
});

test('the recipe says how many limes to buy and follows the servings', async ({ page }) => {
  await page.goto('/#/drink/daiquiri');
  const recipe = page.locator('.fav-recipe');
  await expect(recipe.locator('[data-citrus]')).toHaveText(/1 (lime|limes?)$/);
  await recipe.locator('[data-servings]').fill('14');
  await recipe.locator('[data-servings]').blur();
  await expect(recipe.locator('[data-citrus]')).toHaveText(/ 10 limes?$/);
  await page.goto('/#/drink/old-fashioned');
  await expect(page.locator('.fav-recipe [data-citrus]')).toBeHidden();
});

test('a bowl opens at the glasses its source makes and scales from there', async ({ page }) => {
  await page.route('**/drinks.json', async route => {
    const data = require('../drinks.json');
    await route.fulfill({ json: { ...data, drinks: data.drinks.filter(d => d.id === 'sangria') } });
  });
  await page.goto('/');
  const card = page.locator('#deck .card[data-depth="0"]');
  await card.click();
  await expect(card.locator('[data-servings]')).toHaveValue('15');
  await expect(card.locator('[data-batch]')).toBeVisible();
  await card.locator('[data-act="dec"]').click();
  await expect(card.locator('[data-servings]')).toHaveValue('14');
});

test('stepper and unit patch the card in place', async ({ page }) => {
  await page.route('**/drinks.json', async route => {
    const data = require('../drinks.json');
    await route.fulfill({ json: { ...data, drinks: data.drinks.filter(d => !d.serves) } });
  });
  await page.goto('/');
  const card = page.locator('#deck .card[data-depth="0"]');
  await card.click();
  await card.evaluate(el => { el.dataset.same = 'yes'; });
  await expect(card.locator('[data-batch]')).toBeHidden(); // one glass is not a batch
  await card.locator('[data-act="inc"]').click();
  await expect(card.locator('[data-servings]')).toHaveValue('2');
  await expect(card.locator('[data-batch]')).toHaveText(/^Sats: .+ totalt, .+ per glas/);
  await card.locator('[data-act="dec"]').click();
  await expect(card.locator('[data-batch]')).toBeHidden();
  await card.locator('[data-act="inc"]').click();
  await card.locator('[data-unit="ml"]').click();
  await expect(card.locator('[data-unit="ml"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(card).toHaveAttribute('data-same', 'yes');
  await expect(card).toHaveClass(/flipped/);
});

test('filter chips filter the deck and "all" clears them', async ({ page }) => {
  await page.goto('/');
  const all = page.locator('[data-chip="all"]');
  const total = Number((await all.innerText()).match(/\d+/)[0]);
  await page.locator('[data-chip="bar"]').click();
  await expect(page.locator('[data-chip="bar"]')).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(async () => Number((await all.innerText()).match(/\d+/)[0])).toBeLessThan(total);
  await all.click();
  await expect(page.locator('[data-chip="bar"]')).toHaveAttribute('aria-pressed', 'false');
  await expect(all).toContainText(String(total));
});

test('search keeps the same focused input while results update', async ({ page }) => {
  await page.goto('/#/sok');
  const input = page.locator('#searchInput');
  await input.click();
  await input.evaluate(el => { el.dataset.same = 'yes'; });
  await input.pressSequentially('negr');
  await expect(page.locator('#searchResults .name').first()).toHaveText('Negroni');
  await expect(input).toHaveAttribute('data-same', 'yes');
  await expect(input).toBeFocused();
});

test('removing a favorite can be undone', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-deck="1"]').click();
  const saved = await favorites(page);
  await page.locator('#nav a[href="#/favoriter"]').click();
  await page.locator('.fav-row .fav-remove').click();
  await expect.poll(() => favorites(page)).toEqual([]);
  await page.locator('#toast button').click();
  await expect.poll(() => favorites(page)).toEqual(saved);
  await expect(page.locator('.fav-row')).toHaveCount(1);
});

test('a new shuffle puts the cards just seen at the back', async ({ page }) => {
  await page.goto('/');
  const base = page.locator('select[data-filter="base"]');
  await base.selectOption('gin'); // 19 cards
  const top = () => page.locator('#deck .card[data-depth="0"]:not([data-leaving])').getAttribute('data-id');
  const seen = [];
  for (let i = 0; i < 12; i++) {
    seen.push(await top());
    await page.locator('[data-deck="-1"]').click();
    await expect.poll(top).not.toBe(seen[i]);
  }
  await base.selectOption('');
  await base.selectOption('gin'); // each filter change shuffles again
  const shown = await page.locator('#deck .card').evaluateAll(cards => cards.map(card => card.dataset.id));
  expect(shown).toHaveLength(4);
  expect(shown.filter(id => seen.includes(id))).toEqual([]); // by chance alone: under 1 in 100
});
