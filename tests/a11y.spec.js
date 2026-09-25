const { test, expect } = require('@playwright/test');

test('deck exposes only the current card and flips from the keyboard', async ({ page }) => {
  // a non-empty pantry turns on missing-ingredient status; an empty one hides it entirely
  await page.addInitScript(() => localStorage.setItem('sipdeck', JSON.stringify({ v: 1, favorites: [], pantry: ['water'] })));
  await page.goto('/');

  await expect(page.locator('h1')).toHaveText(/Cocktail deck|Drinkkortlek/);
  expect(await page.locator('.card[data-depth]:not([data-depth="0"])').evaluateAll(cards =>
    cards.every(card => card.inert && card.tabIndex === -1))).toBe(true);

  const card = page.locator('.card[data-depth="0"]');
  await card.focus();
  await page.keyboard.press('Enter');
  await expect(card).toHaveClass(/flipped/);
  await expect(card).toHaveAttribute('aria-expanded', 'true');
  expect(await card.locator('.card-front').evaluate(face => face.inert)).toBe(true);
  expect(await card.locator('.card-back').evaluate(face => face.inert)).toBe(false);

  await page.keyboard.press('Space');
  await expect(card).not.toHaveClass(/flipped/);
  await expect(card.locator('.units button.active')).toHaveAttribute('aria-pressed', 'true');
  await expect(card.locator('.missing .sr-only').first()).toContainText(/Missing|Saknar/);
});

test('a new user sees recipes without any missing status', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.card[data-depth="0"]')).toBeVisible();
  await expect(page.locator('#deck .missing, #deck .missing-tag')).toHaveCount(0);
});

test('account errors are announced and associated with their fields', async ({ page }) => {
  await page.goto('/#/installningar');

  const error = page.locator('#accError');
  await expect(error).toHaveAttribute('role', 'status');
  await expect(error).toHaveAttribute('aria-live', 'polite');
  await expect(page.locator('#accEmail')).toHaveAttribute('aria-describedby', 'accError');
  await expect(page.locator('#accPw')).toHaveAttribute('aria-describedby', 'accError');
});

test('route changes are announced once, the view itself is not live', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#view')).not.toHaveAttribute('aria-live', /.+/);
  await page.locator('#nav a[href="#/favoriter"]').click();
  await expect(page.locator('#routeLive')).toHaveText(/Favorites|Favoriter/);
});

// Text contrast on every main screen: ≥ 4.5:1 (3:1 for large text) against the painted background.
function contrastFailures() {
  const parse = c => { const m = c.match(/[\d.]+/g).map(Number); return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 }; };
  const lum = ({ r, g, b }) => [r, g, b].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; })
    .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
  const over = (top, under) => ({ r: top.r * top.a + under.r * (1 - top.a), g: top.g * top.a + under.g * (1 - top.a), b: top.b * top.a + under.b * (1 - top.a), a: 1 });
  function background(el) {
    const layers = [];
    for (let node = el; node; node = node.parentElement) {
      const bg = parse(getComputedStyle(node).backgroundColor);
      if (bg.a > 0) { layers.push(bg); if (bg.a === 1) break; }
    }
    let color = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = layers.length - 1; i >= 0; i--) color = over(layers[i], color);
    return color;
  }
  const failures = [];
  document.querySelectorAll('body *').forEach(el => {
    if (el.closest('svg, .sr-only, [hidden], [inert], [aria-hidden="true"]')) return;
    const own = Array.from(el.childNodes).some(n => n.nodeType === 3 && n.textContent.trim());
    if (!own || !el.getClientRects().length) return;
    const style = getComputedStyle(el);
    if (style.visibility === 'hidden' || Number(style.opacity) === 0) return;
    const bg = background(el);
    const fg = over(parse(style.color), bg);
    const [hi, lo] = [lum(fg), lum(bg)].sort((a, b) => b - a);
    const ratio = (hi + 0.05) / (lo + 0.05);
    const size = parseFloat(style.fontSize), bold = Number(style.fontWeight) >= 700;
    const need = size >= 24 || (bold && size >= 18.66) ? 3 : 4.5;
    if (ratio < need) failures.push(`${el.className || el.tagName} "${el.textContent.trim().slice(0, 30)}" ${ratio.toFixed(2)}:1`);
  });
  return failures;
}

for (const colorScheme of ['light', 'dark']) {
  test(`text contrast holds in ${colorScheme} mode`, async ({ page }) => {
    await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
    await page.addInitScript(() => localStorage.setItem('sipdeck', JSON.stringify({
      v: 1, favorites: ['negroni', 'margarita'], pantry: ['gin'] })));
    const failures = [];
    for (const route of ['#/', '#/favoriter', '#/favoriter/negroni', '#/skafferi', '#/installningar', '#/sok']) {
      await page.goto('/' + route);
      await page.waitForTimeout(300);
      failures.push(...(await page.evaluate(contrastFailures)).map(f => `${route} ${f}`));
    }
    await page.goto('/');
    await page.locator('.card[data-depth="0"]').focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    failures.push(...(await page.evaluate(contrastFailures)).map(f => `card back ${f}`));
    expect(failures).toEqual([]);
  });
}
