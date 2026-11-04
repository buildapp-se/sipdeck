const { test, expect } = require('@playwright/test');

test('the static recipe page loads without app.js, fits 390px and opens the drink in the app', async ({ page }) => {
  const errors = [], scripts = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); if (r.url().endsWith('.js')) scripts.push(r.url()); });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/drink/margarita/');
  await expect(page.locator('h1')).toHaveText('Margarita');
  await expect(page.locator('li', { hasText: 'Blanco-tequila' })).toContainText('5 cl');
  await expect.poll(() => page.locator('figure img').evaluate(img => img.complete && img.naturalWidth)).toBe(640);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await expect(page.locator('.more a')).toHaveCount(3);
  expect(scripts).toEqual([]);
  await page.locator('a.open').click();
  await expect(page.locator('.fav-detail .card-name')).toHaveText('Margarita');
  expect(errors).toEqual([]);
});
