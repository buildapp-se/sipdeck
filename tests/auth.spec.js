const { test, expect } = require('@playwright/test');

// T6: Google sign-in picks popup in a tab and redirect in an installed app, and a failed redirect
// reports on the next start. The Firebase modules are page.route stubs that record what was called.
async function stubFirebase(page, { standalone = false, redirectError = null, remembered = false } = {}) {
  await page.addInitScript(([standalone, remembered]) => {
    localStorage.setItem('sipdeck', JSON.stringify({ v: 1, favorites: [], pantry: [], settings: { lang: 'sv' } }));
    if (remembered) localStorage.setItem('sipdeck-auth', '1');
    window.__calls = [];
    if (standalone) { // Playwright cannot emulate display-mode, so answer that one query
      const mm = window.matchMedia.bind(window);
      window.matchMedia = q => mm(q === '(display-mode: standalone)' ? '(min-width: 0px)' : q);
    }
  }, [standalone, remembered]);
  const js = body => ({ contentType: 'application/javascript', headers: { 'Access-Control-Allow-Origin': '*' }, body });
  await page.route('https://www.gstatic.com/firebasejs/**/firebase-app.js', r => r.fulfill(js('export const initializeApp = o => (window.__config = o, {});')));
  await page.route('https://www.gstatic.com/firebasejs/**/firebase-auth.js', r => r.fulfill(js(`
    export const getAuth = () => ({});
    export class GoogleAuthProvider {}
    export const onAuthStateChanged = (auth, cb) => setTimeout(() => cb(null), 0);
    export const getRedirectResult = async () => { const e = ${JSON.stringify(redirectError)}; if (e) throw e; return null; };
    export const signInWithPopup = async () => { window.__calls.push('popup'); throw { code: 'auth/popup-closed-by-user' }; };
    export const signInWithRedirect = async () => { window.__calls.push('redirect'); };`)));
}

async function clickGoogle(page) {
  await page.goto('/#/installningar');
  await page.locator('details#account summary').click();
  await page.locator('[data-acc="google"]').click();
  await expect.poll(() => page.evaluate(() => window.__calls.length)).toBe(1);
  return page.evaluate(() => ({ calls: window.__calls, authDomain: window.__config.authDomain }));
}

test('google sign-in: a normal tab uses the popup, a closed popup is not an error', async ({ page }) => {
  await stubFirebase(page);
  const { calls, authDomain } = await clickGoogle(page);
  expect(calls).toEqual(['popup']);
  expect(authDomain).toBe('sipdeck.buildapp.se');
  await expect(page.locator('#accError')).toBeHidden();
});

test('google sign-in: an installed app (display-mode standalone) redirects', async ({ page }) => {
  await stubFirebase(page, { standalone: true });
  expect((await clickGoogle(page)).calls).toEqual(['redirect']);
});

test('google sign-in: a failed redirect shows its error on return', async ({ page }) => {
  await stubFirebase(page, { remembered: true, redirectError: { code: 'auth/too-many-requests' } });
  await page.goto('/#/installningar');
  await expect(page.locator('details#account')).toHaveAttribute('open', '');
  await expect(page.locator('#accError')).toHaveText('För många försök. Vänta en stund och försök igen.');
  await expect(page.locator('#accError')).toBeVisible();
});

test('google sign-in: a cancelled redirect stays quiet', async ({ page }) => {
  await stubFirebase(page, { remembered: true, redirectError: { code: 'auth/redirect-cancelled-by-user' } });
  await page.goto('/#/installningar');
  await expect.poll(() => page.evaluate(() => !!window.__config)).toBe(true);
  await page.waitForTimeout(200); // let getRedirectResult settle
  await expect(page.locator('details#account')).not.toHaveAttribute('open', '');
  await expect(page.locator('#accError')).toBeHidden();
});
