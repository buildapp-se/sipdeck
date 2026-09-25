const { test, expect } = require('@playwright/test');

// batch 5 (F1): a family is one card, the back switches variant in place, search groups variants and tags
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('seeded')) {
      sessionStorage.setItem('seeded', '1');
      localStorage.setItem('sipdeck', JSON.stringify({ v: 1, favorites: [], pantry: [], settings: { lang: 'sv', seenFlipHint: true } }));
    }
  });
});

const favorites = page => page.evaluate(() => JSON.parse(localStorage.getItem('sipdeck')).favorites);

test('the margarita family is one card whose back switches variant in place and saves the one shown', async ({ page }) => {
  await page.route('**/drinks.json', async route => {
    const data = require('../drinks.json');
    await route.fulfill({ json: { ...data, drinks: data.drinks.filter(d => d.family === 'margarita') } });
  });
  await page.goto('/');
  await expect(page.locator('[data-chip="all"] .amount')).toHaveText('1');
  const card = page.locator('#deck .card[data-depth="0"]');
  await expect(card).toHaveAttribute('data-id', 'margarita');
  await expect(card.locator('.variant-chip')).toHaveText('+1 variant');
  await card.click();
  await card.locator('[data-variant="tommys-margarita"]').click();
  const shown = page.locator('#deck .card[data-depth="0"]');
  await expect(shown).toHaveAttribute('data-id', 'tommys-margarita');
  await expect(shown).toHaveClass(/flipped/);
  await expect(shown.locator('[data-variant="tommys-margarita"]')).toBeFocused();
  await expect(shown.locator('.diff-new')).toHaveText(['ny', 'ny']); // agave syrup and the lime-wheel garnish
  await expect(shown.locator('[data-was="tequila-blanco"]')).toHaveText('var 5 cl');
  await expect(shown.locator('.variant-without')).toHaveText('Utan: Triple sec, Saltad kant');
  await shown.locator('[data-act="inc"]').click();
  await expect(shown.locator('[data-was="tequila-blanco"]')).toHaveText('var 10 cl');
  await page.locator('[data-deck="1"]').click();
  await expect.poll(() => favorites(page)).toEqual(['tommys-margarita']);
});

test('search groups a variant hit, opens it preselected, and switches in place', async ({ page }) => {
  await page.goto('/#/sok');
  await page.locator('#searchInput').fill('tommy');
  await expect(page.locator('#searchResults .search-group')).toHaveText('Varianter');
  await expect(page.locator('#searchResults .meta')).toHaveText('Variant av Margarita · 2 i familjen');
  await page.locator('#searchResults .fav-open').click();
  await expect(page).toHaveURL(/#\/favoriter\/tommys-margarita$/);
  await expect(page.locator('.variant-seg [aria-pressed="true"]')).toHaveText("Tommy's");
  await page.locator('.variant-seg [data-variant="margarita"]').click();
  await expect(page).toHaveURL(/#\/favoriter\/margarita$/);
  await expect(page.locator('.fav-hero .card-name')).toHaveText('Margarita');
  await expect(page.locator('.variant-seg [data-variant="margarita"]')).toBeFocused();
  await expect(page.locator('.variant-without')).toHaveCount(0);
});

test('search lists drinks found only through a tag under their own heading', async ({ page }) => {
  await page.goto('/#/sok');
  await page.locator('#searchInput').fill('spicy');
  await expect(page.locator('#searchResults .search-group')).toHaveText('Taggad: spicy');
  await expect(page.locator('#searchResults .fav-row').first()).toBeVisible();
});
