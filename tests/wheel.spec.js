const { test, expect } = require('@playwright/test');

async function openWheel(page) {
  await page.goto('/');
  const entry = page.locator('#wheelEntry');
  await expect(entry).toBeVisible();
  await expect(entry).not.toHaveAttribute('aria-disabled', 'true'); // T18: inactive until the data has loaded
  await entry.click();
  await expect(page).toHaveURL(/\/#\/hjul$/);
  await expect(page.locator('#wheelLayer .wheel-screen')).toBeVisible();
}

test('wheel starts neutral, spins, lands and closes back onto the deck', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await openWheel(page);

  const hub = page.locator('#wheelHub');
  await expect(hub).toBeDisabled(); // T4: no preselected mood
  await expect(page.locator('#wheelStage svg')).toHaveClass(/wheel-unset/);
  await expect(page.locator('[data-wheel-mood][aria-pressed="true"]')).toHaveCount(0);

  // owner 2026-09-25: the moods start on a card over a shrunken wheel, the panel below is empty
  await expect(page.locator('#wheelIntro [data-wheel-mood]')).toHaveCount(5);
  await expect(page.locator('#wheelPanel [data-wheel-mood]')).toHaveCount(0);
  await expect(page.locator('#wheelDisc')).toHaveCSS('scale', '0.88');
  await page.locator('#wheelIntro [data-wheel-mood="1"]').click();
  await expect(page.locator('#wheelIntro')).toHaveCount(0);
  await expect(page.locator('#wheelDisc')).toHaveCSS('scale', 'none');
  await expect(page.locator('[data-wheel-mood="1"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(hub).toBeEnabled();
  await expect(page.locator('#wheelWindowName')).not.toBeEmpty();

  await hub.click();
  await expect(hub).toBeDisabled();
  const result = page.locator('#wheelResult');
  await expect(result).toBeVisible({ timeout: 10000 });
  await expect(result.locator('.wheel-result-name')).not.toBeEmpty();
  await expect(page.locator('#wheelStage')).toHaveClass(/wheel-landed/);
  await expect(page.locator('#wheelStage .wheel-sector.win')).toHaveCount(1);
  await expect(hub).toBeEnabled();

  await page.locator('[data-wheel-act="change"]').click(); // the picker returns in the result card's place
  await expect(result).toHaveCount(0);
  await expect(page.locator('[data-wheel-mood="1"]')).toBeFocused();

  await page.locator('[data-wheel-act="back"]').click();
  await expect(page).toHaveURL(/\/(?:#\/)?$/);
  await expect(page.locator('#wheelLayer')).toBeHidden();
  await expect(page.locator('#deck .card')).not.toHaveCount(0);
  await expect(page.locator('#wheelEntry .wheel-symbol')).toHaveCSS('opacity', '1');
  expect(pageErrors).toEqual([]);
});

test('changing mood patches the drawn wheel in place and keeps its rotation', async ({ page }) => {
  await openWheel(page);
  await page.locator('[data-wheel-mood="0"]').click();
  await page.locator('#wheelHub').click();
  await expect(page.locator('#wheelResult')).toBeVisible({ timeout: 10000 });
  const rotation = await page.locator('#wheelDisc').getAttribute('style');
  await page.locator('#wheelDisc').evaluate(el => { el.dataset.probe = '1'; });

  await page.locator('[data-wheel-act="change"]').click();
  await page.locator('[data-wheel-mood="3"]').click();
  await expect(page.locator('#wheelDisc[data-probe="1"]')).toHaveCount(1); // T17: no re-render
  await expect(page.locator('#wheelDisc')).toHaveAttribute('style', rotation);
  await expect(page.locator('#wheelStage')).not.toHaveClass(/wheel-landed/);
  await expect(page.locator('#wheelHub')).toBeEnabled();
  await expect(page.locator('#wheelStage .wheel-art[href]')).toHaveCount(12);
});

test('picker and result fit above Safari\'s toolbar line at 390 × 844', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openWheel(page);
  await page.locator('[data-wheel-mood="4"]').click(); // level 5 has the tallest card: safety line included
  const bottom = () => page.locator('#wheelPanel').evaluate(el => el.getBoundingClientRect().bottom);
  expect(await bottom()).toBeLessThanOrEqual(664);
  await page.locator('#wheelHub').click();
  await expect(page.locator('#wheelResult .wheel-safety')).toBeVisible({ timeout: 10000 });
  expect(await bottom()).toBeLessThanOrEqual(664);
});

test('reduced motion opens and closes the wheel with a fade only', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openWheel(page);
  await page.locator('[data-wheel-mood="0"]').click();
  await page.locator('#wheelHub').click();
  await expect(page.locator('#wheelResult')).toBeVisible({ timeout: 2000 });

  await page.locator('[data-wheel-act="back"]').click();
  await expect(page.locator('#wheelLayer')).toBeHidden();
  await expect(page.locator('#wheelEntry')).toBeVisible();
});

for (const [lang, lines] of [
  ['sv', ['Det är en dag imorgon också.', 'Du vet var den kommer att landa.', 'Du borde verkligen dricka vatten.']],
  ['en', ["There's a day tomorrow, too.", 'You know where this will land.', 'You should really drink water.']],
]) {
  test(`level 5 result line gets sharper with every landing (${lang})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(l => localStorage.setItem('sipdeck', JSON.stringify({ v: 1, favorites: [], pantry: [], settings: { lang: l } })), lang);
    await openWheel(page);
    await page.locator('[data-wheel-mood="4"]').click();
    for (const line of lines.concat(lines[2])) {
      await page.locator('#wheelHub').click();
      await expect(page.locator('#wheelResult .wheel-safety')).toHaveText(line, { timeout: 3000 });
      await expect(page.locator('#wheelResult .wheel-result-label')).toHaveText(lang === 'en' ? "Don't drink and drive." : 'Din beställning');
      await expect(page.locator('#wheelHub')).toBeEnabled();
    }
  });
}
