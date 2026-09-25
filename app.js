'use strict';

// ---------- string table (EN + SV) — every UI string routes through t(), none hardcoded in markup ----------
const STRINGS = {
  en: {
    nav_deck: 'Deck', nav_favorites: 'Favorites', nav_pantry: 'Pantry', nav_settings: 'Settings',
    nav_label: 'Main navigation',
    wheel_entry: 'Pick for me', wheel_title: 'Pick for me', wheel_back: 'Back',
    wheel_sound_on: 'Sound on', wheel_sound_off: 'Sound off',
    wheel_intro: 'How are you feeling?', wheel_choose: 'Choose a mood to build your wheel.',
    wheel_spin: 'Spin', wheel_respin: 'Re-spin', wheel_result: 'Your order',
    wheel_first: 'First', wheel_under: 'Under the pointer', wheel_turning: 'Spinning', wheel_landed: 'It landed on',
    wheel_pick_below: 'Choose a mood below', wheel_change: 'Change mood', wheel_recipe: 'Show recipe',
    wheel_loading: 'Preparing the wheel...', wheel_error: "Couldn't load the wheel. Reload to try again.",
    wheel_spinning: 'The wheel is spinning', wheel_ready: 'Wheel ready to spin',
    deck_empty: 'No drinks yet. Deal the deck once drinks.json ships.',
    deck_loading: 'Dealing the deck...',
    deck_error: "Couldn't load the deck. Reload to try again.",
    deck_title: 'Cocktail deck',
    deck_no_matches: 'No drinks match those filters. Try another combination.',
    filters_label: 'Filter drinks',
    favorites_title: 'Favorites',
    favorites_empty: 'Nothing saved yet. Swipe right on a drink to save it here.', favorites_to_deck: 'Go to the deck',
    search_entry: 'Search', search_title: 'Search',
    search_placeholder: 'Search name or ingredient',
    search_empty: 'No drinks match that search.',
    search_intro: 'Find a drink by name or ingredient.',
    fav_back: 'Back',
    fav_unfavorite: 'Remove favorite',
    fav_add: 'Save',
    missing_prefix: 'Missing: ', missing_many: 'Missing 3+', missing_tag: 'Missing',
    recipe_title: 'Recipe', ingredients_title: 'Ingredients', method_title: 'Method',
    ingredient_check_hint: 'Check off ingredients as you mix.',
    check_ingredient: 'Check off', copy_recipe: 'Copy recipe',
    copied: 'Copied!', copy_failed: 'Could not copy', servings_copy: 'servings', source_label: 'Source',
    pantry_title: 'Pantry',
    pantry_empty: 'No ingredients are used by the current drinks.',
    pantry_intro: 'Check off what you have. Optional garnishes never block a match.',
    pantry_group_spirits: 'Spirits', pantry_group_liqueurs: 'Liqueurs',
    pantry_group_fresh: 'Fresh & mixers', pantry_group_pantry: 'Pantry staples',
    pantry_almost_title: 'Almost there',
    pantry_search: 'Search ingredients', pantry_search_empty: 'No ingredient matches that search.',
    pantry_count_one: 'You can mix 1 drink', pantry_count_many: 'You can mix {n} drinks',
    settings_sync: 'Sync between devices',
    settings_title: 'Settings',
    settings_lang: 'Language', settings_unit: 'Unit',
    language_en: 'English', language_sv: 'Swedish',
    settings_filter_base: 'Base spirit',
    settings_filter_base_none: 'Any',
    settings_wheel_title: 'Spinning wheel',
    settings_wheel_favorites_only: 'Only favorite drinks',
    settings_wheel_favorites_only_hint: "Tops up from the full menu if you don't have enough favorites.",
    settings_wheel_outcomes_title: 'Beer, wine & shots in the wheel',
    settings_wheel_labels: 'Show names in the wheel sectors',
    wheel_cat_beer_cider: 'Beer & cider', wheel_cat_wine: 'Wine', wheel_cat_shot: 'Shots',
    wheel_cat_cocktail: 'Cocktail', wheel_cat_water: 'Water', wheel_cat_red_bull: 'Red Bull', wheel_cat_bottle: 'Bottle',
    base_gin: 'Gin', base_vodka: 'Vodka', base_rum: 'Rum', base_tequila: 'Tequila',
    base_whiskey: 'Whiskey', base_brandy: 'Brandy', base_other: 'Other / none',
    yes: 'Yes', no: 'No',
    type_sour: 'Sour', type_highball: 'Highball', type_aromatic: 'Aromatic',
    type_spirit_forward: 'Spirit-forward', type_contemporary: 'Contemporary',
    servings: 'Servings',
    servings_decrease: 'Decrease servings', servings_increase: 'Increase servings',
    unit_dash: 'dash', unit_barspoon: 'barspoon', unit_teaspoon: 'tsp', unit_drop: 'drop',
    unit_piece: 'pc', unit_leaf: 'leaf', unit_slice: 'slice', unit_garnish: 'garnish',
    unit_splash: 'splash', unit_top: 'top up',
    account_title: 'Account', account_hint: 'Sign in to sync favorites and pantry across devices.',
    account_google: 'Sign in with Google', account_signed_in_as: 'Signed in as',
    account_signout: 'Sign out', account_delete: 'Delete account',
    account_delete_confirm: 'Delete your account and all synced data? This cannot be undone.',
    account_email: 'Email', account_password: 'Password', account_login: 'Log in',
    account_register: 'Create account', account_forgot: 'Forgot password?',
    account_forgot_sent: 'Password reset email sent.',
    account_link_google: 'Link Google sign-in', account_create_password: 'Create password',
    account_share_hint: 'Your partner can then sign in with this email and password too.',
    account_legal: 'Privacy, storage & terms',
    account_delete_title: 'Delete account?', account_cancel: 'Cancel',
    account_forgot_title: 'Reset password', account_forgot_send: 'Send reset link',
    account_forgot_hint: "Enter your email and we'll send a link for choosing a new password.",
    auth_wrong_password: 'Wrong email or password.', auth_invalid_credential: 'Wrong email or password.',
    auth_user_not_found: 'No account uses that email. Create one instead.',
    auth_email_already_in_use: 'That email already has an account. Log in instead.',
    auth_invalid_email: "That doesn't look like an email address.",
    auth_too_many_requests: 'Too many attempts. Wait a moment and try again.',
    auth_generic: 'Something went wrong. Try again.',
    deck_skip: '‹ Skip', deck_save: 'Save ›', flip_hint: 'Tap for recipe',
    swipe_save: 'Save', swipe_skip: 'Skip', toast_saved: 'Saved', toast_removed: 'Removed', undo: 'Undo',
    chip_all: 'All', chip_matches: 'Matches', chip_bar: 'Bar-servable', chip_makeable: 'Can make', chip_base: 'Base',
    serving_one: 'glass', serving_many: 'glasses',
    glass_coupe: 'coupe', glass_highball: 'highball glass', glass_rocks: 'rocks glass', glass_martini: 'martini glass',
    glass_goblet: 'goblet', glass_irish_coffee: 'Irish coffee glass', glass_margarita: 'margarita glass',
    glass_julep: 'julep cup', glass_hurricane: 'hurricane glass', glass_collins: 'Collins glass',
    glass_wine: 'wine glass', glass_flute: 'flute', glass_shot: 'shot glass',
    method_stirred: 'stirred', method_frozen: 'frozen', method_layered: 'layered',
  },
  sv: {
    wheel_entry: 'Välj åt mig', wheel_title: 'Välj åt mig', wheel_back: 'Tillbaka',
    wheel_sound_on: 'Ljud på', wheel_sound_off: 'Ljud av',
    wheel_intro: 'Hur känns det?', wheel_choose: 'Välj ett läge för att bygga hjulet.',
    wheel_spin: 'Snurra', wheel_respin: 'Snurra igen', wheel_result: 'Din beställning',
    wheel_first: 'Först', wheel_under: 'Under pekaren', wheel_turning: 'Snurrar', wheel_landed: 'Det blev',
    wheel_pick_below: 'Välj läge nedan', wheel_change: 'Byt läge', wheel_recipe: 'Visa recept',
    wheel_loading: 'Förbereder hjulet...', wheel_error: 'Kunde inte ladda hjulet. Ladda om sidan för att försöka igen.',
    wheel_spinning: 'Hjulet snurrar', wheel_ready: 'Hjulet är redo att snurra',
    nav_deck: 'Kortlek', nav_favorites: 'Favoriter', nav_pantry: 'Skafferi', nav_settings: 'Inställningar',
    nav_label: 'Huvudnavigering',
    deck_empty: 'Inga drinkar än. Kortleken delas ut när drinks.json finns.',
    deck_loading: 'Delar ut kortleken...',
    deck_error: 'Kunde inte ladda kortleken. Ladda om sidan för att försöka igen.',
    deck_title: 'Drinkkortlek',
    deck_no_matches: 'Inga drinkar matchar filtren. Prova en annan kombination.',
    filters_label: 'Filtrera drinkar',
    favorites_title: 'Favoriter',
    favorites_empty: 'Inget sparat än. Svep höger på en drink för att spara den här.', favorites_to_deck: 'Till kortleken',
    search_entry: 'Sök', search_title: 'Sök',
    search_placeholder: 'Sök namn eller ingrediens',
    search_empty: 'Inga drinkar matchar sökningen.',
    search_intro: 'Hitta en drink på namn eller ingrediens.',
    fav_back: 'Tillbaka',
    fav_unfavorite: 'Ta bort favorit',
    fav_add: 'Spara',
    missing_prefix: 'Saknar: ', missing_many: 'Saknar 3+', missing_tag: 'Saknas',
    recipe_title: 'Recept', ingredients_title: 'Ingredienser', method_title: 'Gör så här',
    ingredient_check_hint: 'Bocka av ingredienserna medan du blandar.',
    check_ingredient: 'Bocka av', copy_recipe: 'Kopiera receptet',
    copied: 'Kopierat!', copy_failed: 'Kunde inte kopiera', servings_copy: 'portioner', source_label: 'Källa',
    pantry_title: 'Skafferi',
    pantry_empty: 'Inga ingredienser används av de aktuella drinkarna.',
    pantry_intro: 'Bocka av vad du har. Valfri garnering stoppar aldrig en träff.',
    pantry_group_spirits: 'Sprit', pantry_group_liqueurs: 'Likörer',
    pantry_group_fresh: 'Färskt och blanddryck', pantry_group_pantry: 'Skafferivaror',
    pantry_almost_title: 'Nästan klart',
    pantry_search: 'Sök ingrediens', pantry_search_empty: 'Ingen ingrediens matchar sökningen.',
    pantry_count_one: 'Du kan blanda 1 drink', pantry_count_many: 'Du kan blanda {n} drinkar',
    settings_sync: 'Synka mellan enheter',
    settings_title: 'Inställningar',
    settings_lang: 'Språk', settings_unit: 'Enhet',
    language_en: 'Engelska', language_sv: 'Svenska',
    settings_filter_base: 'Bas-sprit',
    settings_filter_base_none: 'Alla',
    settings_wheel_title: 'Snurrhjul',
    settings_wheel_favorites_only: 'Bara favoritdrinkar',
    settings_wheel_favorites_only_hint: 'Fyller på med hela menyn om du inte har tillräckligt många favoriter.',
    settings_wheel_outcomes_title: 'Öl, vin och shots i hjulet',
    settings_wheel_labels: 'Visa namn i hjulets sektorer',
    wheel_cat_beer_cider: 'Öl & cider', wheel_cat_wine: 'Vin', wheel_cat_shot: 'Shots',
    wheel_cat_cocktail: 'Cocktail', wheel_cat_water: 'Vatten', wheel_cat_red_bull: 'Red Bull', wheel_cat_bottle: 'Flaska',
    base_gin: 'Gin', base_vodka: 'Vodka', base_rum: 'Rom', base_tequila: 'Tequila',
    base_whiskey: 'Whisky', base_brandy: 'Brandy', base_other: 'Annan / ingen',
    yes: 'Ja', no: 'Nej',
    type_sour: 'Sour', type_highball: 'Highball', type_aromatic: 'Aromatisk',
    type_spirit_forward: 'Spritdominerad', type_contemporary: 'Samtida',
    servings: 'Portioner',
    servings_decrease: 'Minska antal portioner', servings_increase: 'Öka antal portioner',
    unit_dash: 'stänk', unit_barspoon: 'barsked', unit_teaspoon: 'tsk', unit_drop: 'droppe',
    unit_piece: 'st', unit_leaf: 'blad', unit_slice: 'skiva', unit_garnish: 'garnering',
    unit_splash: 'skvätt', unit_top: 'toppa upp',
    account_title: 'Konto', account_hint: 'Logga in för att synka favoriter och skafferi mellan enheter.',
    account_google: 'Logga in med Google', account_signed_in_as: 'Inloggad som',
    account_signout: 'Logga ut', account_delete: 'Radera konto',
    account_delete_confirm: 'Radera ditt konto och all synkad data? Går inte att ångra.',
    account_email: 'E-post', account_password: 'Lösenord', account_login: 'Logga in',
    account_register: 'Skapa konto', account_forgot: 'Glömt lösenordet?',
    account_forgot_sent: 'Återställningsmejl skickat.',
    account_link_google: 'Koppla Google-inloggning', account_create_password: 'Skapa lösenord',
    account_share_hint: 'Din partner kan då också logga in med samma e-post och lösenord.',
    account_legal: 'Integritet, lokal lagring och villkor',
    account_delete_title: 'Radera kontot?', account_cancel: 'Avbryt',
    account_forgot_title: 'Återställ lösenord', account_forgot_send: 'Skicka återställningslänk',
    account_forgot_hint: 'Skriv din e-post så skickar vi en länk där du väljer ett nytt lösenord.',
    auth_wrong_password: 'Fel e-post eller lösenord.', auth_invalid_credential: 'Fel e-post eller lösenord.',
    auth_user_not_found: 'Inget konto använder den e-posten. Skapa ett i stället.',
    auth_email_already_in_use: 'E-posten har redan ett konto. Logga in i stället.',
    auth_invalid_email: 'Det ser inte ut som en e-postadress.',
    auth_too_many_requests: 'För många försök. Vänta en stund och försök igen.',
    auth_generic: 'Något gick fel. Försök igen.',
    deck_skip: '‹ Hoppa över', deck_save: 'Spara ›', flip_hint: 'Tryck för recept',
    swipe_save: 'Spara', swipe_skip: 'Hoppa över', toast_saved: 'Sparad', toast_removed: 'Borttagen', undo: 'Ångra',
    chip_all: 'Alla', chip_matches: 'Träffar', chip_bar: 'Barserverbara', chip_makeable: 'Kan blanda', chip_base: 'Bas',
    serving_one: 'glas', serving_many: 'glas',
    glass_coupe: 'coupeglas', glass_highball: 'highballglas', glass_rocks: 'rocksglas', glass_martini: 'martiniglas',
    glass_goblet: 'goblet', glass_irish_coffee: 'irish coffee-glas', glass_margarita: 'margaritaglas',
    glass_julep: 'julepbägare', glass_hurricane: 'hurricaneglas', glass_collins: 'collinsglas',
    glass_wine: 'vinglas', glass_flute: 'champagneglas', glass_shot: 'shotglas',
    method_stirred: 'rörd', method_frozen: 'frusen', method_layered: 'skiktad',
  },
};
function t(lang, key) { return (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key; }

// ---------- pure functions (exported for test.js) ----------
const UNITS = ['cl', 'ml', 'oz'];

function detectLang(navLang) {
  return typeof navLang === 'string' && navLang.toLowerCase().indexOf('sv') === 0 ? 'sv' : 'en';
}

function defaultState(lang) {
  return {
    v: 1,
    favorites: [],
    pantry: [],
    settings: {
      lang: lang === 'sv' ? 'sv' : 'en',
      unit: 'cl',
      servings: 1,
      filters: { bar: false, base: null },
      wheelFavoritesOnly: false,
      wheelOutcomesExcluded: [],
      wheelLabels: false,
      seenFlipHint: false,
    },
  };
}

function normalizeState(raw, lang) {
  const d = defaultState(lang);
  if (!raw || typeof raw !== 'object') return d;
  const rs = raw.settings && typeof raw.settings === 'object' ? raw.settings : {};
  const rf = rs.filters && typeof rs.filters === 'object' ? rs.filters : {};
  return {
    v: 1,
    favorites: Array.isArray(raw.favorites) ? raw.favorites.filter(x => typeof x === 'string') : [],
    pantry: Array.isArray(raw.pantry) ? raw.pantry.filter(x => typeof x === 'string') : [],
    settings: {
      lang: rs.lang === 'sv' || rs.lang === 'en' ? rs.lang : d.settings.lang,
      unit: UNITS.includes(rs.unit) ? rs.unit : 'cl',
      servings: Number.isInteger(rs.servings) && rs.servings >= 1 && rs.servings <= 100 ? rs.servings : 1,
      filters: {
        bar: rf.bar === true,
        base: typeof rf.base === 'string' && rf.base ? rf.base : null,
      },
      wheelFavoritesOnly: rs.wheelFavoritesOnly === true,
      wheelOutcomesExcluded: Array.isArray(rs.wheelOutcomesExcluded)
        ? rs.wheelOutcomesExcluded.filter(x => typeof x === 'string') : [],
      wheelLabels: rs.wheelLabels === true,
      seenFlipHint: rs.seenFlipHint === true,
    },
  };
}

function hid(hash, prefix) {
  if (typeof hash !== 'string' || hash.indexOf(prefix) !== 0) return null;
  const encoded = hash.slice(prefix.length);
  if (!encoded || encoded.includes('/')) return null;
  try { return decodeURIComponent(encoded); } catch (e) { return null; }
}
const favoriteIdFromHash = h => hid(h, '#/favoriter/');
const drinkIdFromHash = h => hid(h, '#/drink/');

// ---------- unit engine (BACKLOG 3) — canonical ml, linear scaling, bar rounding, display ----------
function scaleMl(ml, servings) { return ml * servings; }
const MAX_SERVINGS = 100;
function normalizeServingCount(value) {
  const count = Math.round(Number(value));
  return Number.isFinite(count) ? Math.max(1, Math.min(MAX_SERVINGS, count)) : 1;
}

function convert(ml, unit) {
  if (unit === 'cl') return ml / 10;
  if (unit === 'oz') return ml / 30;
  return ml; // ml passthrough
}

function roundForUnit(value, unit) {
  if (unit === 'oz') return Math.round(value * 4) / 4;
  if (unit === 'cl') return Math.round(value * 2) / 2;
  return Math.round(value / 5) * 5; // ml
}

function formatNumber(value, lang) {
  const locale = lang === 'sv' ? 'sv-SE' : 'en-US';
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value)
    .replace(/[  ]/g, ' '); // normalize Intl no-break thousands space to a plain space
}

const OZ_FRACTIONS = { 0.25: '¼', 0.5: '½', 0.75: '¾' };
function formatOz(value, lang) {
  const whole = Math.floor(value);
  const frac = Math.round((value - whole) * 100) / 100;
  const fracChar = OZ_FRACTIONS[frac] || '';
  if (!fracChar) return formatNumber(whole, lang);
  return whole === 0 ? fracChar : formatNumber(whole, lang) + fracChar;
}

function shuffle(arr, rng) {
  const a = arr.slice(), r = rng || Math.random;
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

function advanceQueue(queue, saved) {
  const next = Array.isArray(queue) ? queue.slice() : [];
  if (!next.length) return next;
  const top = next.shift();
  if (!saved) next.push(top);
  return next;
}

function swipeDirectionForKey(key) {
  if (key === 'ArrowLeft') return -1;
  if (key === 'ArrowRight') return 1;
  return 0;
}

const BASE_FILTERS = ['gin', 'vodka', 'rum', 'tequila', 'whiskey', 'brandy', 'other'];

function matchesFilters(drink, filters) {
  const f = filters || {};
  if (f.bar && drink.bar !== true) return false;
  if (!f.base) return true;
  if (f.base === 'other') return !BASE_FILTERS.slice(0, -1).includes(drink.base);
  return drink.base === f.base;
}

function canMake(drink, pantry) {
  const have = pantry instanceof Set ? pantry : new Set(Array.isArray(pantry) ? pantry : []);
  return Array.isArray(drink.ingredients) && drink.ingredients
    .filter(line => line.essential)
    .every(line => have.has(line.id));
}

function filterDrinks(drinks, filters, pantry) {
  const have = Array.isArray(pantry) ? new Set(pantry) : null;
  return (Array.isArray(drinks) ? drinks : [])
    .filter(drink => matchesFilters(drink, filters) && (!have || canMake(drink, have)));
}

function searchHaystack(drink, ingredientNames) {
  return [drink.name].concat(ingredientNames || []).join(' ').toLowerCase();
}

function matchesSearch(haystack, query) {
  const q = (query || '').trim().toLowerCase();
  return !q || haystack.indexOf(q) !== -1;
}

function missingIngredients(drink, pantry) {
  const have = pantry instanceof Set ? pantry : new Set(Array.isArray(pantry) ? pantry : []);
  return Array.isArray(drink.ingredients)
    ? drink.ingredients.filter(line => line.essential && !have.has(line.id))
    : [];
}

// how many drinks use each ingredient; the pantry lists the most used first in every group
function ingredientCounts(drinks) {
  const counts = {};
  drinks.forEach(drink => new Set(drink.ingredients.map(line => line.id)).forEach(id => { counts[id] = (counts[id] || 0) + 1; }));
  return counts;
}

// Firebase auth codes the account UI names in its own words. Other Firebase codes get the generic
// line; errors without a code are the app's own (already worded) messages, so null keeps them.
const AUTH_ERRORS = ['wrong-password', 'invalid-credential', 'user-not-found', 'email-already-in-use', 'invalid-email', 'too-many-requests'];
function authErrorKey(err) {
  const code = err && typeof err.code === 'string' ? err.code.replace(/^auth\//, '') : '';
  return AUTH_ERRORS.includes(code) ? 'auth_' + code.replace(/-/g, '_') : code ? 'auth_generic' : null;
}

function mergeState(local, server) { // union pantry/favorites (never lose a logged-out edit); settings stay server-wins
  return {
    v: 1,
    favorites: Array.from(new Set([...server.favorites, ...local.favorites])),
    pantry: Array.from(new Set([...server.pantry, ...local.pantry])),
    settings: server.settings,
  };
}

function reconcileState(base, local, remote) {
  const changed = (before, here, there) =>
    JSON.stringify(here) !== JSON.stringify(before) ? here : there;
  const set = (before, here, there) => Array.from(new Set([...before, ...here, ...there]))
    .filter(item => here.includes(item) !== before.includes(item)
      ? here.includes(item) : there.includes(item));
  return {
    v: 1,
    favorites: set(base.favorites, local.favorites, remote.favorites),
    pantry: set(base.pantry, local.pantry, remote.pantry),
    settings: {
      lang: changed(base.settings.lang, local.settings.lang, remote.settings.lang),
      unit: changed(base.settings.unit, local.settings.unit, remote.settings.unit),
      servings: changed(base.settings.servings, local.settings.servings, remote.settings.servings),
      filters: {
        bar: changed(base.settings.filters.bar, local.settings.filters.bar, remote.settings.filters.bar),
        base: changed(base.settings.filters.base, local.settings.filters.base, remote.settings.filters.base),
      },
      wheelFavoritesOnly: changed(base.settings.wheelFavoritesOnly,
        local.settings.wheelFavoritesOnly, remote.settings.wheelFavoritesOnly),
      wheelOutcomesExcluded: set(base.settings.wheelOutcomesExcluded,
        local.settings.wheelOutcomesExcluded, remote.settings.wheelOutcomesExcluded),
      wheelLabels: changed(base.settings.wheelLabels, local.settings.wheelLabels, remote.settings.wheelLabels),
      seenFlipHint: local.settings.seenFlipHint || remote.settings.seenFlipHint,
    },
  };
}

// ---------- spinning wheel: pure catalog, weighting and geometry ----------
function wheelRng(rng) {
  const n = Number((rng || Math.random)());
  return Number.isFinite(n) ? Math.max(0, Math.min(0.999999999, n)) : 0;
}

function weightedSampleUnique(items, count, weightFn, rng) {
  const pool = (Array.isArray(items) ? items : []).slice();
  const picked = [];
  while (pool.length && picked.length < count) {
    const weights = pool.map(item => Math.max(0, Number(weightFn(item)) || 0));
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    if (total <= 0) break;
    let target = wheelRng(rng) * total;
    let index = weights.length - 1;
    for (let i = 0; i < weights.length; i++) {
      target -= weights[i];
      if (target < 0) { index = i; break; }
    }
    picked.push(pool.splice(index, 1)[0]);
  }
  return picked;
}

function wheelCocktailWeight(drink, mood) {
  if (!drink || drink.bar !== true) return 0;
  const strong = Array.isArray(drink.tags) && drink.tags.includes('strong');
  return strong ? Number(mood && mood.strongWeight) || 0 : 1;
}

function wheelDrinkName(drink) {
  if (!drink) return { en: '', sv: '' };
  if (typeof drink.name === 'string') return { en: drink.name, sv: drink.name };
  return { en: drink.name.en || drink.name.sv || drink.id, sv: drink.name.sv || drink.name.en || drink.id };
}

function buildSpinLineup(wheel, moodId, drinks, rng, prefs) {
  if (!wheel || !Array.isArray(wheel.moods) || !wheel.outcomes) return [];
  const mood = wheel.moods.find(item => item.id === moodId);
  if (!mood || !Array.isArray(mood.slots) || mood.slots.length !== 12) return [];
  const options = prefs || {};
  const excluded = new Set(Array.isArray(options.excludedOutcomes) ? options.excludedOutcomes : []);
  const useBottle = moodId === 'fresh' && mood.slots.includes('flex') && wheelRng(rng) < 1 / 3;

  const categoryPools = {};
  const categoryIndexes = {};
  const artIndexes = {};
  Object.keys(wheel.outcomes).forEach(id => {
    if (excluded.has(id)) return;
    const outcome = wheel.outcomes[id];
    (categoryPools[outcome.category] || (categoryPools[outcome.category] = [])).push(id);
  });
  Object.keys(categoryPools).forEach(category => {
    categoryPools[category] = shuffle(categoryPools[category], rng);
    categoryIndexes[category] = 0;
  });
  // a slot whose whole category got excluded falls back to a cocktail instead of breaking the lineup
  const deadCategorySlots = mood.slots
    .filter(slot => slot !== 'cocktail' && slot !== 'flex' && !(categoryPools[slot] && categoryPools[slot].length))
    .length;

  const cocktailCount = mood.slots.filter(slot => slot === 'cocktail').length +
    (mood.slots.includes('flex') && !useBottle ? 1 : 0) + deadCategorySlots;
  const cocktailPool = (Array.isArray(drinks) ? drinks : [])
    .filter(drink => wheelCocktailWeight(drink, mood) > 0);
  let primaryPool = cocktailPool;
  if (options.favoritesOnly) {
    const favSet = new Set(Array.isArray(options.favorites) ? options.favorites : []);
    const favPool = cocktailPool.filter(drink => favSet.has(drink.id));
    if (favPool.length) primaryPool = favPool;
  }
  let cocktailPicks = weightedSampleUnique(
    primaryPool, cocktailCount, drink => wheelCocktailWeight(drink, mood), rng);
  if (primaryPool !== cocktailPool && cocktailPicks.length < cocktailCount) {
    // favorites ran out before filling every cocktail slot: top up from the full catalog, no repeats
    const pickedIds = new Set(cocktailPicks.map(drink => drink.id));
    const remainder = cocktailPool.filter(drink => !pickedIds.has(drink.id));
    cocktailPicks = cocktailPicks.concat(weightedSampleUnique(
      remainder, cocktailCount - cocktailPicks.length, drink => wheelCocktailWeight(drink, mood), rng));
  }
  while (cocktailPicks.length < cocktailCount && cocktailPool.length) {
    cocktailPicks = cocktailPicks.concat(weightedSampleUnique(
      cocktailPool, Math.min(cocktailCount - cocktailPicks.length, cocktailPool.length),
      drink => wheelCocktailWeight(drink, mood), rng));
  }
  let cocktailIndex = 0;
  function simpleEntry(id) {
    const outcome = wheel.outcomes[id];
    if (!outcome) return null;
    const arts = Array.isArray(outcome.art) ? outcome.art : [];
    const artIndex = artIndexes[id] || 0;
    artIndexes[id] = artIndex + 1;
    return {
      kind: 'simple', outcomeId: id, category: outcome.category,
      sector: outcome.sector, result: outcome.result,
      art: arts.length ? arts[artIndex % arts.length] : '',
      eligible: !mood.forcedOutcome || id === mood.forcedOutcome,
    };
  }
  function takeCategory(category) {
    const pool = categoryPools[category] || [];
    if (!pool.length) return null;
    const index = categoryIndexes[category] || 0;
    categoryIndexes[category] = index + 1;
    return simpleEntry(pool[index % pool.length]);
  }
  function takeCocktail() {
    const drink = cocktailPicks[cocktailIndex++];
    if (!drink) return null;
    const name = wheelDrinkName(drink);
    return {
      kind: 'cocktail', outcomeId: drink.id, category: 'cocktail',
      sector: name, result: name, art: `img/${drink.id}.webp`,
      eligible: !mood.forcedOutcome,
    };
  }
  let lineup = mood.slots.map(slot => {
    if (slot === 'cocktail') return takeCocktail();
    if (slot === 'flex') return useBottle ? takeCategory('bottle') : takeCocktail();
    const pool = categoryPools[slot] || [];
    return pool.length ? takeCategory(slot) : takeCocktail();
  }).filter(Boolean);
  if (lineup.length !== 12) return [];
  const offset = Math.floor(wheelRng(rng) * lineup.length);
  lineup = lineup.slice(offset).concat(lineup.slice(0, offset));
  return lineup.map((entry, index) => Object.assign({ key: `${entry.kind}-${entry.outcomeId}-${index}` }, entry));
}

function selectWheelIndex(lineup, rng) {
  const eligible = (Array.isArray(lineup) ? lineup : [])
    .map((entry, index) => ({ entry, index })).filter(item => item.entry.eligible !== false);
  if (!eligible.length) return -1;
  return eligible[Math.floor(wheelRng(rng) * eligible.length)].index;
}

// ---------- wheel motion (design review T15–T16, from design_handoff_sipdeck/motion.js) ----------
// Damped spring as a CSS linear() easing; zeta < 1 overshoots, dur is the time to rest in ms.
function springLinear(zeta, dur, n) {
  const steps = n || 48, w = 6.9 / (zeta * dur / 1000), wd = w * Math.sqrt(1 - zeta * zeta), pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps * dur / 1000;
    pts.push((1 - Math.exp(-zeta * w * t) * (Math.cos(wd * t) + zeta * w / wd * Math.sin(wd * t))).toFixed(4));
  }
  pts[steps] = '1';
  return `linear(${pts.join(',')})`;
}

// 200 ms wind-up of −10°, one 3600 ms main curve whose speed is zero at both ends
// (derivative 20u(1−u)^3), a 4° overshoot and a 350 ms settle back. 4150 ms in total.
const SPIN = { windup: 200, main: 3600, settle: 350, windupDeg: 10, overshootDeg: 4, turns: 4 };
function spinAngle(t, travel) {
  const s = SPIN;
  if (t <= 0) return 0;
  if (t < s.windup) return -s.windupDeg * (1 - Math.cos(Math.PI * t / s.windup)) / 2;
  const t2 = t - s.windup;
  if (t2 < s.main) {
    const u = t2 / s.main;
    return -s.windupDeg + (travel + s.windupDeg + s.overshootDeg) * (1 - Math.pow(1 - u, 4) * (1 + 4 * u));
  }
  const t3 = t2 - s.main;
  if (t3 < s.settle) {
    const x = t3 / s.settle, e = x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    return travel + s.overshootDeg - s.overshootDeg * e;
  }
  return travel;
}
const SPIN_MS = SPIN.windup + SPIN.main + SPIN.settle;

// Degrees from the current angle to a random safe spot inside sector `index`, after four full turns.
function landingTravel(current, index, rng, count) {
  const sectors = count || 12, step = 360 / sectors, jitter = (wheelRng(rng) * 2 - 1) * step * 0.34;
  const desired = ((-index * step - jitter) % 360 + 360) % 360;
  const cur = ((current % 360) + 360) % 360;
  return SPIN.turns * 360 + ((desired - cur) % 360 + 360) % 360;
}

// Sector under the top pointer for a disc rotated `angle` degrees.
function sectorAtAngle(angle, count) {
  const sectors = count || 12;
  return Math.floor((((-angle % 360) + 360) % 360 + 180 / sectors) / (360 / sectors)) % sectors;
}

const WHEEL_COLORS = {
  cocktail: 'oklch(0.9 0.045 150)', 'beer-cider': 'oklch(0.9 0.05 85)', wine: 'oklch(0.9 0.045 20)',
  shot: 'oklch(0.88 0.045 300)', water: 'oklch(0.91 0.045 230)', 'red-bull': '#E3DACA', bottle: 'oklch(0.9 0.05 60)',
};

function wheelSectorPath(index, count, radius) {
  const sectors = count || 12, r = radius || 49;
  const step = 360 / sectors, start = -90 + index * step - step / 2, end = start + step;
  const point = angle => {
    const rad = angle * Math.PI / 180;
    return [50 + r * Math.cos(rad), 50 + r * Math.sin(rad)];
  };
  const a = point(start), b = point(end);
  return `M50 50L${a[0].toFixed(3)} ${a[1].toFixed(3)}A${r} ${r} 0 0 1 ${b[0].toFixed(3)} ${b[1].toFixed(3)}Z`;
}

const GLASS_SILHOUETTES = {
  coupe: '<path d="M18 25h60c-3 17-13 25-30 25S21 42 18 25Z"/><path d="M48 50v27M32 79h32"/>',
  highball: '<path d="M29 14h38l-4 66H33l-4-66Z"/><path d="M34 25h28"/>',
  rocks: '<path d="M25 35h46l-5 43H30l-5-43Z"/><path d="M30 47h36"/>',
  martini: '<path d="M17 20h62L48 53 17 20Z"/><path d="M48 53v24M32 79h32"/>',
  flute: '<path d="M34 10h28c0 25-4 39-14 39S34 35 34 10Z"/><path d="M48 49v29M35 80h26"/>',
  shot: '<path d="M34 34h28l-3 38H37l-3-38Z"/><path d="M36 43h24"/>',
  wine: '<path d="M27 16h42c-1 25-8 37-21 37S28 41 27 16Z"/><path d="M48 53v24M34 79h28"/>',
};
const GLASS = GLASS_SILHOUETTES;
Object.assign(GLASS,{collins:GLASS.highball,goblet:GLASS.wine,hurricane:GLASS.highball,'irish-coffee':GLASS.highball,julep:GLASS.rocks,margarita:GLASS.martini});

function glassPlaceholder(glass) {
  const known = Object.prototype.hasOwnProperty.call(GLASS_SILHOUETTES, glass);
  const key = known ? glass : 'rocks';
  return `<svg viewBox="0 0 96 96" class="glass-ph glass-${key}" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">${GLASS_SILHOUETTES[key]}</g></svg>`;
}

function formatAmount(line, servings, unit, lang) {
  if (typeof line.ml === 'number') {
    const rounded = roundForUnit(convert(scaleMl(line.ml, servings), unit), unit);
    const display = unit === 'oz' ? formatOz(rounded, lang) : formatNumber(rounded, lang);
    return `${display} ${unit}`;
  }
  const scaled = line.qty * servings;
  const rounded = Number.isInteger(scaled) ? scaled : Math.round(scaled * 10) / 10;
  return `${formatNumber(rounded, lang)} ${line.unit}`;
}

function formatLineAmount(line, servings, unit, lang) {
  if (line.unit === 'top') return t(lang, 'unit_top');
  if (line.unit === 'barspoon') {
    const spoons = line.qty * servings;
    return `${formatNumber(spoons, lang)} ${t(lang, 'unit_barspoon')} (${formatNumber(spoons / 2, lang)} cl)`;
  }
  const amount = formatAmount(line, servings, unit, lang);
  return typeof line.ml === 'number' ? amount : amount.replace(line.unit, t(lang, 'unit_' + line.unit));
}

function drinkAsText(drink, ingredients, servings, unit, lang) {
  const name = typeof drink.name === 'string' ? drink.name : (drink.name[lang] || drink.name.en);
  const lines = [name, '', `${formatNumber(servings, lang)} ${t(lang, 'servings_copy')}`, '', t(lang, 'ingredients_title')];
  drink.ingredients.forEach(line => {
    const ingredient = ingredients[line.id] || {};
    const ingredientName = ingredient[lang] || ingredient.en || line.id;
    lines.push(`- ${formatLineAmount(line, servings, unit, lang)} ${ingredientName}`);
  });
  lines.push('', t(lang, 'method_title'), drink.method[lang] || drink.method.en);
  return lines.join('\n');
}

if (typeof module !== 'undefined') module.exports = {
  STRINGS, t, UNITS, detectLang, defaultState, normalizeState, favoriteIdFromHash, drinkIdFromHash,
  scaleMl, convert, roundForUnit, formatNumber, formatOz, formatAmount,
  formatLineAmount, drinkAsText,
  shuffle, advanceQueue, swipeDirectionForKey, BASE_FILTERS, matchesFilters, canMake, filterDrinks,
  missingIngredients, mergeState, searchHaystack, matchesSearch, ingredientCounts, authErrorKey, AUTH_ERRORS,
  normalizeServingCount, MAX_SERVINGS,
  reconcileState,
  weightedSampleUnique, wheelCocktailWeight, buildSpinLineup, selectWheelIndex,
  wheelSectorPath, springLinear, SPIN, SPIN_MS, spinAngle, landingTravel, sectorAtAngle, WHEEL_COLORS,
  GLASS_SILHOUETTES, glassPlaceholder,
};

// ---------- app (browser only) ----------
if (typeof document !== 'undefined') (function () {
  const KEY = 'sipdeck';
  const $ = sel => document.querySelector(sel);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const lang0 = detectLang(navigator.language);
  let raw = null;
  try { raw = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { raw = null; }
  let state = normalizeState(raw, lang0);

  // ---------- accounts + sync (BACKLOG 15): Firebase Auth identity + Worker/D1 state blob.
  // Logged out = untouched, unchanged localStorage-only behavior. ----------
  let fb = null, fbUser = null, fbPromise = null, pushTimer = null, pushPromise = null;
  let syncUid = null, syncBase = null, syncEtag = null, deletingAccount = false;
  let accountOpen = false, accountMode = 'login', accountEmail = ''; // transient UI: 'login' | 'register' | 'forgot'
  const API = 'https://sipdeck-api.sipdeck.workers.dev';
  const AUTH_KEY = KEY + '-auth';

  async function ensureFirebase() {
    if (fb) return fb;
    if (!fbPromise) fbPromise = Promise.all([
      import('https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js'),
    ]).then(([core, auth]) => {
      const app = core.initializeApp({
        apiKey: 'AIzaSyCVDnImzoWxop-n1nKYfO7dde8qQl-SPZs',
        authDomain: 'sipdeck.firebaseapp.com',
        projectId: 'sipdeck',
        appId: '1:735040812464:web:ee5191404d377daac45275',
      });
      fb = { auth: auth.getAuth(app), ...auth };
      initFirebase();
      return fb;
    }).catch(err => { fbPromise = null; throw err; });
    return fbPromise;
  }

  function save() {
    localStorage.setItem(KEY, JSON.stringify(state));
    if (fbUser && !deletingAccount) pushState();
  }
  save(); // persist first-run defaults immediately

  function lang() { return state.settings.lang; }
  function unit() { return lang() === 'sv' && state.settings.unit === 'oz' ? 'cl' : state.settings.unit; }
  function recipeUnits() { return lang() === 'sv' ? UNITS.slice(0, 2) : UNITS; }

  async function authedFetch(path, opts) {
    const user = fbUser;
    if (!user) throw new Error('Inte inloggad.');
    const token = await user.getIdToken();
    const headers = Object.assign({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, (opts && opts.headers) || {});
    return fetch(API + path, Object.assign({}, opts, { headers }));
  }

  function syncKey(uid) { return KEY + '-sync-' + uid; }
  function rememberSync(base, etag) {
    syncBase = normalizeState(base, lang());
    syncEtag = etag;
    localStorage.setItem(syncKey(syncUid), JSON.stringify({ base: syncBase, etag }));
  }
  function restoreSync(uid) {
    syncUid = uid;
    syncBase = null;
    syncEtag = null;
    try {
      const saved = JSON.parse(localStorage.getItem(syncKey(uid)) || 'null');
      if (saved && saved.base && typeof saved.etag === 'string') {
        syncBase = normalizeState(saved.base, lang());
        syncEtag = saved.etag;
      }
    } catch (e) { /* invalid local sync metadata starts a safe first merge */ }
  }

  async function flushState() {
    if (pushPromise || !fbUser || deletingAccount) return;
    const uid = fbUser.uid;
    pushPromise = (async () => {
      let again = true;
      while (again && fbUser && fbUser.uid === uid && !deletingAccount) {
        again = false;
        const outgoing = normalizeState(state, lang());
        const res = await authedFetch('/state', {
          method: 'PUT', body: JSON.stringify({ state: outgoing, etag: syncEtag }),
        });
        const data = await res.json();
        if (res.status === 409 && typeof data.etag === 'string') {
          const remote = normalizeState(data.state, lang());
          state = syncBase ? reconcileState(syncBase, state, remote) : mergeState(state, remote);
          syncEtag = data.etag;
          localStorage.setItem(KEY, JSON.stringify(state));
          again = true;
        } else {
          if (!res.ok || typeof data.etag !== 'string') throw new Error(data.error || 'Synkningen misslyckades.');
          if (fbUser && fbUser.uid === uid) rememberSync(outgoing, data.etag);
          again = JSON.stringify(outgoing) !== JSON.stringify(state);
        }
      }
    })().catch(() => {}).finally(() => { pushPromise = null; });
    await pushPromise;
  }

  async function pullState() {
    try {
      restoreSync(fbUser.uid);
      const res = await authedFetch('/state');
      const data = await res.json();
      if (!res.ok || typeof data.etag !== 'string') throw new Error(data.error || 'Synkningen misslyckades.');
      const remote = normalizeState(data.state, lang());
      syncEtag = data.etag;
      if (data.state) state = syncBase
        ? reconcileState(syncBase, state, remote) : mergeState(state, remote);
      localStorage.setItem(KEY, JSON.stringify(state));
      if (JSON.stringify(state) === JSON.stringify(remote)) rememberSync(remote, data.etag);
      else await flushState();
    } catch (e) { /* offline/blocked: stay on local state */ }
  }

  function pushState() {
    clearTimeout(pushTimer);
    pushTimer = setTimeout(flushState, 800);
  }
  function initFirebase() {
    fb.onAuthStateChanged(fb.auth, async user => {
      fbUser = user;
      if (user) {
        localStorage.setItem(AUTH_KEY, '1');
        await pullState();
      }
      else {
        localStorage.removeItem(AUTH_KEY);
        clearTimeout(pushTimer);
        syncUid = syncBase = syncEtag = null;
      }
      render();
    });
  }

  let db = null;       // null = loading; {ingredients, drinks} once fetch resolves
  let drinksFailed = false;
  fetch('drinks.json').then(r => r.json()).then(data => {
    db = { ingredients: data.ingredients || {}, drinks: Array.isArray(data.drinks) ? data.drinks : [] };
    render();
  }).catch(() => { drinksFailed = true; render(); });

  let wheelData = null, wheelFailed = false, wheelPromise = null;
  let wheelMoodId = null, wheelLineup = null, wheelResult = null;
  let wheelRotation = 0, wheelSpinning = false, wheelMuted = false, wheelLevel5Spins = 0;
  let wheelVisitActive = false, wheelOpenedFromHome = false, wheelSpinId = 0, wheelResultIndex = -1, wheelPicker = false;

  function loadWheelData() {
    if (wheelPromise) return wheelPromise;
    const rerenderRoutes = ['#/hjul', '#/installningar'];
    wheelPromise = fetch('wheel.json').then(r => {
      if (!r.ok) throw new Error('wheel data');
      return r.json();
    }).then(data => {
      wheelData = data;
      wheelFailed = false;
      syncWheelEntry();
      if (rerenderRoutes.includes(location.hash || '#/')) render();
      return data;
    }).catch(() => {
      wheelFailed = true;
      if (rerenderRoutes.includes(location.hash || '#/')) render();
    });
    return wheelPromise;
  }
  loadWheelData();

  function resetWheelVisit() {
    wheelSpinId++; // an unfinished spin never lands after the visit
    wheelPicker = false;
    wheelMoodId = null;
    wheelLineup = null;
    wheelResult = null;
    wheelRotation = 0;
    wheelSpinning = false;
    wheelMuted = false;
    wheelLevel5Spins = 0;
    wheelVisitActive = false;
    wheelOpenedFromHome = false;
  }

  // ---------- views ----------
  function viewDeck() {
    if (drinksFailed) return `<p class="empty">${esc(t(lang(), 'deck_error'))}</p>`;
    if (!db) return `<p class="empty">${esc(t(lang(), 'deck_loading'))}</p>`;
    if (!db.drinks.length) return `<p class="empty">${esc(t(lang(), 'deck_empty'))}</p>`;
    const f = state.settings.filters;
    const baseOptions = [`<option value="">${esc(t(lang(), 'settings_filter_base_none'))}</option>`]
      .concat(BASE_FILTERS.map(base => `<option value="${base}"${f.base === base ? ' selected' : ''}>${esc(t(lang(), 'base_' + base))}</option>`))
      .join('');
    const matches = filteredDrinks();
    const filtered = !!(f.bar || f.base || makeableOnly);
    const chip = (name, on, label) => `<button class="fchip${on ? ' on' : ''}" data-chip="${name}" aria-pressed="${on}">${label}</button>`;
    // T11: one scrollable chip row above the deck; the match count lives in the first chip
    const chips = `<div class="fchips" role="group" aria-label="${esc(t(lang(), 'filters_label'))}">
      ${chip('all', !filtered, `${esc(t(lang(), filtered ? 'chip_matches' : 'chip_all'))} <span class="amount">${matches.length}</span>`)}
      ${chip('bar', f.bar, esc(t(lang(), 'chip_bar')))}
      ${chip('makeable', makeableOnly, esc(t(lang(), 'chip_makeable')))}
      <label class="fchip fchip-select${f.base ? ' on' : ''}"><span aria-hidden="true">${esc(f.base ? t(lang(), 'base_' + f.base) : t(lang(), 'chip_base'))} ▾</span><select data-filter="base" aria-label="${esc(t(lang(), 'settings_filter_base'))}">${baseOptions}</select></label>
    </div>`;
    const deck = matches.length ? `<div class="deck" id="deck"></div>
      <div class="deck-actions">
        <button class="deck-skip" data-deck="-1">${esc(t(lang(), 'deck_skip'))}</button>
        <button class="deck-save" data-deck="1">${esc(t(lang(), 'deck_save'))}</button>
      </div>` : `<p class="empty">${esc(t(lang(), 'deck_no_matches'))}</p>`;
    return `<h1 class="sr-only">${esc(t(lang(), 'deck_title'))}</h1>${chips}${deck}`;
  }

  // ---------- deck: the one imperative-DOM zone (drag/flip animate outside re-renders) ----------
  let deckQueue = null; // drink ids, [0] = top card; survives view switches, reshuffles on exhaustion
  let flippedId = null; // top-card id when showing the recipe back
  let favOpenId = null;  // id of the favorite currently opened in detail view, or null = list
  let favChecked = new Set(); // mixing progress for the open favorite; resets when it closes
  let favHistoryEntry = false; // true only when this session opened detail from the favorite list
  let makeableOnly = false; // transient deck mode; pantry itself is the persisted source of truth
  let searchQuery = ''; // transient #/sok input; cleared whenever the route leaves search
  let pantryQuery = ''; // transient pantry filter; cleared whenever the route leaves the pantry
  let servingDrinkId = null, recipeServings = 1;

  function servingsFor(id) {
    if (servingDrinkId !== id) {
      servingDrinkId = id;
      recipeServings = 1;
    }
    return recipeServings;
  }

  function setServings(id, value) {
    servingDrinkId = id;
    recipeServings = normalizeServingCount(value);
  }

  function filteredDrinks() {
    return filterDrinks(db.drinks, state.settings.filters, makeableOnly ? state.pantry : null);
  }

  function ensureQueue() {
    if (!deckQueue || !deckQueue.length) deckQueue = shuffle(filteredDrinks().map(d => d.id));
  }

  function ingName(id) {
    const n = db.ingredients[id];
    return n ? (n[lang()] || n.en) : id;
  }

  function taxonomyName(kind, id) {
    return t(lang(), kind + '_' + String(id).replace(/-/g, '_'));
  }

  // an empty pantry means "not using the pantry", not "missing everything": no missing status then.
  // Optional lines (garnish) never count as missing, same rule as canMake.
  function isMissing(have, line) { return state.pantry.length > 0 && line.essential && !have.has(line.id); }
  function missingTag() { return `<span class="missing-tag" aria-hidden="true">${esc(t(lang(), 'missing_tag'))}</span>`; }

  function chipTags(ingredients, have) {
    return ingredients.filter(l => l.essential)
      .map(l => {
        const missing = isMissing(have, l);
        return `<span class="chip${missing ? ' missing' : ''}">${missing ? `<span class="sr-only">${esc(t(lang(), 'missing_prefix'))}</span>` : ''}${esc(ingName(l.id))}</span>`;
      }).join('');
  }

  // garnish rows show a bare count; the word "garnish" moves to a right-hand tag
  function amountText(line, servings) {
    return line.unit === 'garnish' ? formatNumber(line.qty * servings, lang()) : formatLineAmount(line, servings, unit(), lang());
  }

  function lineTag(line, missing) {
    if (missing) return missingTag();
    return line.unit === 'garnish' ? `<span class="garnish-tag">${esc(t(lang(), 'unit_garnish'))}</span>` : '';
  }

  function ingLine(line, have, servings, index) {
    const missing = isMissing(have, line);
    const cls = (missing ? 'missing' : '') + (line.unit === 'garnish' ? ' garnish' : '');
    return `<li class="${cls.trim()}">${missing ? `<span class="sr-only">${esc(t(lang(), 'missing_prefix'))}</span>` : ''}<span class="amount" data-line="${index}">${esc(amountText(line, servings))}</span><span>${esc(ingName(line.id))}</span>${lineTag(line, missing)}</li>`;
  }

  const METHOD_TAGS = ['stirred', 'frozen', 'layered'];
  function recipeMeta(drink, withMethod) {
    const method = withMethod && (drink.tags || []).find(tag => METHOD_TAGS.includes(tag));
    return [taxonomyName('type', drink.type), taxonomyName('glass', drink.glass), method && taxonomyName('method', method)]
      .filter(Boolean).join(' · ');
  }

  function servingWord(servings) { return t(lang(), servings === 1 ? 'serving_one' : 'serving_many'); }

  // shared by the card back (data-act) and the favorite detail (data-fav-act)
  function recipeControls(id, servings, act) {
    const selectedUnit = unit();
    const unitBtns = recipeUnits().map(u =>
      `<button data-${act}="unit" data-unit="${u}" aria-pressed="${u === selectedUnit}"${u === selectedUnit ? ' class="active"' : ''}>${u}</button>`).join('');
    return `<div class="stepper" role="group" aria-label="${esc(t(lang(), 'servings'))}">
        <button data-${act}="dec" aria-label="${esc(t(lang(), 'servings_decrease'))}">−</button>
        <input class="servings-input amount" data-servings data-id="${esc(id)}" type="number"
          min="1" max="${MAX_SERVINGS}" step="1" inputmode="numeric" value="${servings}"
          aria-label="${esc(t(lang(), 'servings'))}"><span class="servings-unit" aria-hidden="true">${esc(servingWord(servings))}</span>
        <button data-${act}="inc" aria-label="${esc(t(lang(), 'servings_increase'))}">+</button>
      </div>
      <div class="units" role="group" aria-label="${esc(t(lang(), 'settings_unit'))}">${unitBtns}</div>`;
  }

  // T13: steppers and units patch amounts, inputs and unit buttons in place instead of render()
  function refreshRecipes() {
    $('#view').querySelectorAll('.card, .fav-recipe').forEach(box => {
      const input = box.querySelector('[data-servings]');
      const drink = input && db.drinks.find(d => d.id === input.dataset.id);
      if (!drink) return;
      const servings = box.dataset.depth && box.dataset.depth !== '0' ? 1 : servingsFor(drink.id);
      input.value = servings;
      box.querySelector('.servings-unit').textContent = servingWord(servings);
      box.querySelectorAll('.amount[data-line]').forEach(el => {
        el.textContent = amountText(drink.ingredients[Number(el.dataset.line)], servings);
      });
      box.querySelectorAll('.units button').forEach(b => {
        const on = b.dataset.unit === unit();
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', String(on));
      });
    });
  }

  function wireArt(img) {
    const revealArt = () => img.classList.add('loaded');
    img.addEventListener('load', revealArt, { once: true });
    img.addEventListener('error', () => { img.hidden = true; }, { once: true });
    if (img.complete && img.naturalWidth) revealArt();
  }

  function artMarkup(drink) {
    return `${glassPlaceholder(drink.glass)}<img class="cocktail-art" src="img/${esc(drink.id)}.webp" alt="" loading="lazy" decoding="async" draggable="false">`;
  }

  function buildCard(drink, depth, opts) {
    opts = opts || {};
    const flipped = 'flipped' in opts ? opts.flipped : (depth === 0 && flippedId === drink.id);
    const tint = opts.tint !== false;
    const el = document.createElement('article');
    el.className = 'card' + (flipped ? ' flipped' : '');
    el.dataset.depth = depth;
    el.dataset.id = drink.id;
    el.tabIndex = depth === 0 ? 0 : -1;
    el.inert = depth !== 0;
    el.setAttribute('aria-keyshortcuts', 'Enter Space ArrowLeft ArrowRight');
    el.setAttribute('aria-label', drink.name);
    const have = new Set(state.pantry);
    const tags = chipTags(drink.ingredients, have);
    const servings = depth === 0 ? servingsFor(drink.id) : 1;
    const hint = state.settings.seenFlipHint ? '' : `<span class="flip-hint">${esc(t(lang(), 'flip_hint'))}</span>`;
    const source = drink.source && drink.source.label
      ? `<p class="card-source">${esc(t(lang(), 'source_label'))}: ${esc(drink.source.label)}</p>` : '';
    el.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-front">
          <div class="card-art">${artMarkup(drink)}</div>
          <div class="card-title"><h2 class="card-name">${esc(drink.name)}</h2>${hint}</div>
          <div class="card-meta">${esc(recipeMeta(drink, false))}</div>
          <div class="card-tags">${tags}</div>
        </div>
        <div class="card-face card-back">
          <h2 class="card-name">${esc(drink.name)}</h2>
          <div class="card-meta">${esc(recipeMeta(drink, true))}</div>
          <div class="card-recipe">
            <ul class="ing">${drink.ingredients.map((l, i) => ingLine(l, have, servings, i)).join('')}</ul>
            <p class="card-method">${esc(drink.method[lang()] || drink.method.en)}</p>
          </div>
          <div class="card-ctrl">${recipeControls(drink.id, servings, 'act')}</div>
          ${source}
        </div>
      </div>${tint ? `
      <div class="tint tint-save"></div>
      <div class="tint tint-skip"></div>
      <span class="swipe-label swipe-label-save" aria-hidden="true">${esc(t(lang(), 'swipe_save'))}</span>
      <span class="swipe-label swipe-label-skip" aria-hidden="true">${esc(t(lang(), 'swipe_skip'))}</span>` : ''}`;
    const art = el.querySelector('.cocktail-art');
    setCardFlipped(el, flipped);
    wireArt(art);
    return el;
  }

  function setCardFlipped(card, flipped) {
    card.classList.toggle('flipped', flipped);
    card.setAttribute('aria-expanded', String(flipped));
    const front = card.querySelector('.card-front');
    const back = card.querySelector('.card-back');
    front.inert = flipped;
    back.inert = !flipped;
    front.setAttribute('aria-hidden', String(flipped));
    back.setAttribute('aria-hidden', String(!flipped));
  }

  function mountDeck() {
    const deckEl = $('#deck');
    if (!deckEl) return;
    ensureQueue();
    const byId = {};
    db.drinks.forEach(d => { byId[d.id] = d; });
    const visible = deckQueue.slice(0, 4);
    for (let i = visible.length - 1; i >= 0; i--) deckEl.appendChild(buildCard(byId[visible[i]], i));
    deckEl.addEventListener('click', e => {
      const b = e.target.closest('button[data-act]');
      if (!b) return;
      const s = state.settings;
      const card = b.closest('.card');
      const input = card && card.querySelector('[data-servings]');
      if (b.dataset.act === 'inc') setServings(card.dataset.id, Number(input.value) + 1);
      else if (b.dataset.act === 'dec') setServings(card.dataset.id, Number(input.value) - 1);
      else if (b.dataset.act === 'unit') { s.unit = b.dataset.unit; save(); }
      refreshRecipes();
    });
    attachDrag(deckEl.querySelector('.card[data-depth="0"]'));
  }

  // leavingCard is null when a card comes back (undo) instead of leaving
  function promoteDeck(leavingCard) {
    const deckEl = $('#deck');
    if (!deckEl) return;
    const moveFocus = leavingCard && (leavingCard === document.activeElement || leavingCard.contains(document.activeElement));
    if (leavingCard) {
      leavingCard.inert = true;
      leavingCard.tabIndex = -1;
      leavingCard.dataset.depth = 'out'; // never matches [data-depth="0"] while it flies away
    }
    ensureQueue();
    const desired = deckQueue.slice(0, 4);
    Array.from(deckEl.querySelectorAll('.card')).forEach(card => {
      if (card !== leavingCard && !desired.includes(card.dataset.id)) card.remove();
    });
    desired.forEach((id, depth) => {
      let card = Array.from(deckEl.querySelectorAll('.card')).find(el => el !== leavingCard && el.dataset.id === id);
      if (!card) {
        const drink = db.drinks.find(item => item.id === id);
        card = buildCard(drink, depth);
        if (depth === 0) deckEl.appendChild(card); // a restored top card paints above the rest
        else deckEl.insertBefore(card, deckEl.firstChild);
      }
      card.dataset.depth = depth;
      card.tabIndex = depth === 0 ? 0 : -1;
      card.inert = depth !== 0;
    });
    const nextCard = Array.from(deckEl.querySelectorAll('.card'))
      .find(el => el !== leavingCard && el.dataset.depth === '0');
    attachDrag(nextCard);
    if (moveFocus && nextCard) nextCard.focus();
  }

  function flipTop(card) {
    const id = deckQueue[0];
    flippedId = flippedId === id ? null : id;
    setCardFlipped(card, flippedId === id);
    if (!state.settings.seenFlipHint) { // the hint has done its job after the first flip
      state.settings.seenFlipHint = true;
      save();
      $('#view').querySelectorAll('.flip-hint').forEach(el => el.remove());
    }
  }

  function attachDrag(card) {
    if (!card) return;
    const cues = ['.tint-save', '.tint-skip', '.swipe-label-save', '.swipe-label-skip'].map(sel => card.querySelector(sel));
    const showCues = (save, skip) => cues.forEach((el, i) => { el.style.opacity = i % 2 ? skip : save; });
    const threshold = () => card.offsetWidth * 0.35;
    let dragging = false, moved = false, startX = 0, startY = 0, dx = 0, dy = 0;
    let lastX = 0, lastT = 0, vx = 0;

    card.addEventListener('keydown', e => {
      if (e.target !== card || (e.key !== 'Enter' && e.key !== ' ')) return;
      e.preventDefault();
      flipTop(card);
    });

    card.addEventListener('pointerdown', e => {
      if (e.target.closest('.card-ctrl')) return; // controls are dead zones
      if (!e.target.closest('.card-recipe')) e.preventDefault(); // let recipe text scroll vertically
      dragging = true; moved = false;
      startX = lastX = e.clientX; startY = e.clientY; dx = dy = vx = 0; lastT = e.timeStamp;
      try { card.setPointerCapture(e.pointerId); } catch (err) { /* capture is nice-to-have; drag works without it */ }
      card.style.transition = 'none';
      card.style.willChange = 'transform';
    });

    card.addEventListener('pointermove', e => {
      if (!dragging) return;
      dx = e.clientX - startX; dy = e.clientY - startY;
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) moved = true;
      const dt = e.timeStamp - lastT;
      if (dt > 0) { vx = (e.clientX - lastX) / dt; lastX = e.clientX; lastT = e.timeStamp; }
      card.style.transform = `translate(${dx}px, ${dy * 0.4}px) rotate(${dx * 0.04}deg)`;
      const p = dx / threshold();
      const a = Math.abs(p) < 0.3 ? 0 : Math.min(1, (Math.abs(p) - 0.3) / 0.7);
      showCues(p > 0 ? a : 0, p < 0 ? a : 0);
    });

    function settle(e) {
      if (!dragging) return;
      dragging = false;
      card.style.willChange = '';
      const flick = Math.abs(vx) > 0.6 && vx * dx > 0;
      if (Math.abs(dx) > threshold() || flick) {
        flyOff(card, dx > 0 ? 1 : -1, dy, dx, vx);
      } else {
        showCues(0, 0);
        card.style.transition = 'transform var(--sd-t-spring) var(--sd-ease-spring)';
        card.style.transform = '';
        if (!moved && !e.target.closest('.card-ctrl')) flipTop(card); // a tap, not a drag
      }
    }
    card.addEventListener('pointerup', settle);
    card.addEventListener('pointercancel', () => {
      dragging = false;
      card.style.willChange = '';
      card.style.transform = '';
      showCues(0, 0);
    });
    card.addEventListener('dragstart', e => e.preventDefault());
  }

  // dx/vx come from a drag: the exit keeps the finger's speed. Buttons and keys use the 320 ms token.
  function flyOff(card, dir, dy, dx, vx) {
    if (card.dataset.leaving) return;
    card.dataset.leaving = 'true';
    const x = (window.innerWidth + card.offsetWidth) * dir;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ms = reduced ? 0 : vx ? Math.max(180, Math.min(360, Math.abs(x - dx) / Math.max(Math.abs(vx), 0.8))) : 320;
    card.style.transition = `transform ${Math.round(ms)}ms var(--sd-ease-fly)`; // never fades, it leaves
    card.style.transform = `translate(${x}px, ${dy * 0.4}px) rotate(${dir * 18}deg)`;
    const id = deckQueue[0];
    if (dir > 0) { // save (A3): idempotent, out of this cycle; exhaustion reshuffles the full set
      if (!state.favorites.includes(id)) state.favorites.push(id);
      deckQueue = advanceQueue(deckQueue, true);
      save();
      updateNav();
      showToast(t(lang(), 'toast_saved'), () => {
        state.favorites = state.favorites.filter(x => x !== id);
        save();
        updateNav();
        deckQueue = [id].concat(deckQueue.filter(x => x !== id));
        flippedId = null;
        promoteDeck(null);
      });
    } else { // skip (A2): to the back of the deck, nothing is ever dismissed
      deckQueue = advanceQueue(deckQueue, false);
    }
    flippedId = null; // flip state resets when a card leaves the top (A4)
    promoteDeck(card);
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      card.removeEventListener('transitionend', onEnd);
      card.remove();
    };
    const onEnd = e => { if (e.target === card) finish(); };
    card.addEventListener('transitionend', onEnd);
    setTimeout(finish, 450); // reduced-motion sets 0ms durations, which never fire transitionend
  }

  // ---------- toast with undo (T8): one at a time, 4 s ----------
  let toastTimer = null, toastUndo = null;
  function showToast(text, undo) {
    const el = $('#toast');
    el.querySelector('span').textContent = text;
    el.querySelector('button').textContent = t(lang(), 'undo');
    toastUndo = undo;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 4000);
  }
  function hideToast() { $('#toast').hidden = true; toastUndo = null; }
  $('#toast button').addEventListener('click', () => { const undo = toastUndo; hideToast(); if (undo) undo(); });

  // ---------- favorites: compact image list -> one continuous, swipe-free recipe detail ----------
  function favDrink() {
    return favOpenId && db ? db.drinks.find(d => d.id === favOpenId) || null : null;
  }

  function missingBadge(drink) {
    const missing = state.pantry.length ? missingIngredients(drink, state.pantry) : [];
    if (!missing.length) return '';
    const text = missing.length > 2
      ? t(lang(), 'missing_many')
      : t(lang(), 'missing_prefix') + missing.map(line => ingName(line.id)).join(', ');
    return `<span class="fav-missing">${esc(text)}</span>`;
  }

  function copyText(text) {
    return navigator.clipboard.writeText(text);
  }

  function viewFavorites() {
    const title = `<h1 class="screen-title">${esc(t(lang(), 'favorites_title'))}</h1>`;
    if (!db) return `${title}<p class="empty">${esc(t(lang(), 'deck_loading'))}</p>`; // ponytail: shared fetch, same loading copy
    const open = favDrink();
    if (favOpenId && !open) favOpenId = null; // favorite id vanished from db: just close, no crash
    if (open) {
      const servings = servingsFor(open.id);
      const have = new Set(state.pantry);
      const tags = chipTags(open.ingredients, have);
      const ingredientRows = open.ingredients.map((line, i) => {
        const checked = favChecked.has(line.id);
        const missing = isMissing(have, line);
        return `<label class="fav-ing-row${checked ? ' done' : ''}${line.unit === 'garnish' ? ' garnish' : ''}">
          <input type="checkbox" data-fav-ing="${esc(line.id)}"${checked ? ' checked' : ''} aria-label="${esc(t(lang(), 'check_ingredient') + ' ' + ingName(line.id))}">
          <span class="amount" data-line="${i}">${esc(amountText(line, servings))}</span>
          <span>${missing ? `<span class="sr-only">${esc(t(lang(), 'missing_prefix'))}</span>` : ''}${esc(ingName(line.id))}</span>${lineTag(line, missing)}
        </label>`;
      }).join('');
      const source = open.source && open.source.url && open.source.label
        ? `<p class="fav-source"><a href="${esc(open.source.url)}" target="_blank" rel="noopener noreferrer">${esc(t(lang(), 'source_label'))}: ${esc(open.source.label)}</a></p>`
        : '';
      return `${title}
        <div class="fav-toolbar">
          <button id="favClose" class="fav-back">${esc(t(lang(), 'fav_back'))}</button>
          <button class="fav-remove" data-act="fav" data-id="${esc(open.id)}">${esc(t(lang(), state.favorites.includes(open.id) ? 'fav_unfavorite' : 'fav_add'))}</button>
        </div>
        <article class="fav-detail">
          <section class="fav-hero">
            <div class="fav-detail-art">${artMarkup(open)}</div>
            <h2 class="card-name">${esc(open.name)}</h2>
            <div class="card-meta">${esc(recipeMeta(open, true))}</div>
            <div class="card-tags">${tags}</div>
          </section>
          <section class="fav-recipe">
            <h2>${esc(t(lang(), 'recipe_title'))}</h2>
            <div class="fav-recipe-controls">${recipeControls(open.id, servings, 'fav-act')}</div>
            <h3>${esc(t(lang(), 'ingredients_title'))}</h3>
            <p class="fav-hint">${esc(t(lang(), 'ingredient_check_hint'))}</p>
            <div class="fav-ing-list">${ingredientRows}</div>
            <h3>${esc(t(lang(), 'method_title'))}</h3>
            <p class="fav-method">${esc(open.method[lang()] || open.method.en)}</p>
            ${source}
            <button class="fav-copy" data-copy-fav>${esc(t(lang(), 'copy_recipe'))}</button>
          </section>
        </article>`;
    }
    const rows = state.favorites.map(id => db.drinks.find(d => d.id === id)).filter(Boolean); // skip ids not in db
    if (!rows.length) return `${title}<p class="empty">${esc(t(lang(), 'favorites_empty'))}</p>
      <p class="empty-action"><a class="pill-btn" href="#/">${esc(t(lang(), 'favorites_to_deck'))}</a></p>`;
    const list = rows.map(d => `
      <div class="list-card fav-row">
        <button class="fav-open" data-id="${esc(d.id)}">
          <span class="fav-thumb">${artMarkup(d)}</span>
          <span class="fav-info">
            <span class="name">${esc(d.name)}</span>
            <span class="meta">${esc(taxonomyName('type', d.type))}</span>
            ${missingBadge(d)}
          </span>
        </button>
        <button class="fav-remove" data-act="fav" data-id="${esc(d.id)}" aria-label="${esc(t(lang(), 'fav_unfavorite'))}">&times;</button>
      </div>`).join('');
    return `${title}${list}`;
  }

  function viewPantry() {
    const title = `<h1 class="screen-title">${esc(t(lang(), 'pantry_title'))}</h1>`;
    if (!db) return `${title}<p class="empty">${esc(t(lang(), 'deck_loading'))}</p>`;
    const used = new Set();
    db.drinks.forEach(drink => drink.ingredients.forEach(line => used.add(line.id)));
    if (!used.size) return `${title}<p class="empty">${esc(t(lang(), 'pantry_empty'))}</p>`;
    const groups = { spirits: [], liqueurs: [], fresh: [], pantry: [] };
    used.forEach(id => {
      const ingredient = db.ingredients[id];
      const group = ingredient && groups[ingredient.group] ? ingredient.group : 'pantry';
      groups[group].push(id);
    });
    const counts = ingredientCounts(db.drinks);
    const fieldsets = Object.keys(groups).map(group => {
      const items = groups[group]
        .sort((a, b) => counts[b] - counts[a] || ingName(a).localeCompare(ingName(b), lang()))
        .map(id => `<label class="pantry-item"><input type="checkbox" data-pantry="${esc(id)}"${state.pantry.includes(id) ? ' checked' : ''}> <span>${esc(ingName(id))}</span></label>`)
        .join('');
      return items ? `<fieldset class="pantry-group"><legend>${esc(t(lang(), 'pantry_group_' + group))}</legend><div class="pantry-list">${items}</div></fieldset>` : '';
    }).join('');
    return `${title}
      <input type="search" id="pantrySearch" class="search-input" value="${esc(pantryQuery)}"
        placeholder="${esc(t(lang(), 'pantry_search'))}" aria-label="${esc(t(lang(), 'pantry_search'))}">
      <p class="pantry-count" id="pantryCount" role="status">${esc(pantryCountText())}</p>
      <div id="pantryAlmost">${pantryAlmostMarkup()}</div>
      <p class="pantry-intro">${esc(t(lang(), 'pantry_intro'))}</p>${fieldsets}<p class="empty" id="pantryNoHits" hidden>${esc(t(lang(), 'pantry_search_empty'))}</p>`;
  }

  function pantryCountText() {
    const n = db.drinks.filter(drink => canMake(drink, state.pantry)).length;
    return t(lang(), n === 1 ? 'pantry_count_one' : 'pantry_count_many').replace('{n}', n);
  }

  // drinks one ingredient away, first on the page but in a sideways row, so checking an item never
  // pushes the checkboxes down. An empty pantry is "not using the pantry", so no section then.
  function pantryAlmostMarkup() {
    const almost = state.pantry.length ? db.drinks
      .map(drink => ({ drink, missing: missingIngredients(drink, state.pantry) }))
      .filter(x => x.missing.length === 1) : [];
    return almost.length ? `
      <h2 class="pantry-almost-title">${esc(t(lang(), 'pantry_almost_title'))}</h2>
      <div class="pantry-almost-list">${almost.map(({ drink, missing }) => `
        <a class="list-card pantry-almost-row" href="#/drink/${esc(drink.id)}">
          <span class="name">${esc(drink.name)}</span>
          <span class="meta">${esc(t(lang(), 'missing_prefix') + ingName(missing[0].id))}</span>
        </a>`).join('')}</div>` : '';
  }

  // the search hides items in place; the list is never re-rendered, so checkboxes keep focus
  function filterPantry() {
    const q = pantryQuery.trim().toLowerCase();
    let any = false;
    $('#view').querySelectorAll('.pantry-group').forEach(group => {
      let shown = 0;
      group.querySelectorAll('.pantry-item').forEach(item => {
        item.hidden = !item.textContent.toLowerCase().includes(q);
        if (!item.hidden) shown++;
      });
      group.hidden = !shown;
      any = any || shown > 0;
    });
    $('#pantryNoHits').hidden = any;
  }

  function wheelMood() { return wheelData && wheelData.moods.find(mood => mood.id === wheelMoodId) || null; }
  function localText(value) { return value && (value[lang()] || value.en) || ''; }

  function wheelArtCentre(index) {
    const rad = index * 30 * Math.PI / 180;
    return [50 + 36 * Math.sin(rad), 50 - 36 * Math.cos(rad)].map(n => n.toFixed(3));
  }
  function wheelChoices() {
    return wheelLineup ? wheelLineup.map(entry => localText(entry.sector)).join(', ') : t(lang(), 'wheel_pick_below');
  }

  // T14: one colour per category, art in rings, sector names only with the wheelLabels setting.
  // Without a lineup this draws the neutral wheel shown before a mood is chosen (T4).
  function wheelSvgMarkup() {
    const labels = state.settings.wheelLabels;
    const defs = Array.from({ length: 12 }, (_, i) => {
      const [cx, cy] = wheelArtCentre(i);
      return `<clipPath id="wheel-art-${i}"><circle cx="${cx}" cy="${cy}" r="8.1"/></clipPath>`;
    }).join('');
    const sectors = Array.from({ length: 12 }, (_, i) => {
      const entry = wheelLineup && wheelLineup[i], [cx, cy] = wheelArtCentre(i);
      const flip = i > 6; // labels start at the hub and read outward; the left half turns so they stay upright
      const label = labels ? `<text class="wheel-sector-label" data-label="${i}" x="${flip ? 34.5 : 65.5}" y="50.9" text-anchor="${flip ? 'end' : 'start'}" transform="rotate(${i * 30 + (flip ? 90 : -90)} 50 50)">${entry ? esc(localText(entry.sector)) : ''}</text>` : '';
      return `<path class="wheel-sector" data-sector="${i}" d="${wheelSectorPath(i)}" fill="${entry ? WHEEL_COLORS[entry.category] : '#F4EDE2'}"/>` +
        `<circle class="wheel-art-ring" data-sector="${i}" cx="${cx}" cy="${cy}" r="8.5"/>` +
        `<image class="wheel-art" data-sector="${i}"${entry ? ` href="${esc(entry.art)}"` : ''} x="${(cx - 8.1).toFixed(3)}" y="${(cy - 8.1).toFixed(3)}" width="16.2" height="16.2" preserveAspectRatio="xMidYMid slice" clip-path="url(#wheel-art-${i})" transform="rotate(${i * 30} ${cx} ${cy})"/>${label}`;
    }).join('');
    return `<svg${wheelLineup ? '' : ' class="wheel-unset"'} viewBox="0 0 100 100" role="img" aria-label="${esc(wheelChoices())}"><defs>${defs}</defs>${sectors}<path class="wheel-win-outline" id="wheelWin" d=""/><circle class="wheel-rim" cx="50" cy="50" r="49.5"/></svg>`;
  }

  function wheelLegendMarkup() {
    if (!wheelLineup) return '';
    return Array.from(new Set(wheelLineup.map(entry => entry.category))).map(cat =>
      `<span class="wheel-key"><i style="background:${WHEEL_COLORS[cat]}"></i>${esc(t(lang(), 'wheel_cat_' + cat.replace(/-/g, '_')))}</span>`).join('');
  }

  function wheelSupportingCopy(mood) {
    if (!mood) return t(lang(), 'wheel_choose');
    if (mood.id === 'shitfaced' && wheelLevel5Spins > 0 && Array.isArray(mood.repeatCopy)) {
      return localText(mood.repeatCopy[Math.min(wheelLevel5Spins - 1, mood.repeatCopy.length - 1)]);
    }
    return localText(mood.copy);
  }

  // T14.7–8: the mood picker and the result card share one slot under the wheel
  function wheelPanelMarkup() {
    const mood = wheelMood(), entry = wheelResult;
    if (!wheelData || !db) return `<p class="wheel-mood-copy">${esc(t(lang(), wheelFailed ? 'wheel_error' : 'wheel_loading'))}</p>`;
    if (entry && !wheelPicker) {
      const safety = mood && mood.forcedOutcome && mood.safety ? `<p class="wheel-safety">${esc(localText(mood.safety))}</p>` : '';
      const recipe = entry.kind === 'cocktail'
        ? `<button class="fav-open" data-id="${esc(entry.outcomeId)}">${esc(t(lang(), 'wheel_recipe'))}</button>` : '';
      return `<div class="wheel-result" id="wheelResult">
        <div class="wheel-result-head"><img class="wheel-result-art" src="${esc(entry.art)}" alt="">
          <div class="wheel-result-text"><p class="wheel-result-label">${esc(t(lang(), 'wheel_result'))}</p>
          <h2 class="wheel-result-name">${esc(localText(entry.result))}</h2></div></div>
        ${safety}
        <div class="wheel-result-btns">${recipe}<button data-wheel-act="change">${esc(t(lang(), 'wheel_change'))} · ${esc(localText(mood.name))}</button></div>
      </div>`;
    }
    const moods = wheelData.moods.map((item, i) =>
      `<button class="wheel-mood" data-wheel-mood="${i}" aria-pressed="${item.id === wheelMoodId}"${wheelSpinning ? ' disabled' : ''}>${esc(localText(item.name))}</button>`).join('');
    return `<p class="wheel-q" id="wheelQ">${esc(t(lang(), 'wheel_intro'))}</p>
      <div class="wheel-moods" role="group" aria-labelledby="wheelQ">${moods}</div>
      <p class="wheel-mood-copy">${esc(wheelSupportingCopy(mood))}</p>`;
  }

  function viewWheel() {
    loadWheelData();
    const canSpin = !!(wheelMood() && wheelLineup && !wheelSpinning);
    return `<section class="wheel-screen">
      <div class="wheel-bg"></div>
      <header class="wheel-topbar">
        <button class="wheel-back" data-wheel-act="back">‹ ${esc(t(lang(), 'nav_deck'))}</button>
        <h1 class="wheel-title">${esc(t(lang(), 'wheel_title'))}</h1>
        <button class="wheel-sound" data-wheel-act="sound" aria-pressed="${!wheelMuted}">${esc(t(lang(), wheelMuted ? 'wheel_sound_off' : 'wheel_sound_on'))}</button>
      </header>
      <div class="wheel-body">
        <div class="wheel-window" aria-hidden="true">
          <p class="wheel-window-label" id="wheelWindowLabel"></p><p class="wheel-window-name" id="wheelWindowName"></p>
        </div>
        <div class="wheel-stage" id="wheelStage">
          <div class="wheel-disc" id="wheelDisc" style="transform:rotate(${wheelRotation}deg)">${wheelSvgMarkup()}</div>
          <button class="wheel-hub-button" id="wheelHub" data-wheel-act="spin"${canSpin ? '' : ' disabled'}>${esc(t(lang(), wheelResult ? 'wheel_respin' : 'wheel_spin'))}</button>
          <div class="wheel-pointer" id="wheelPointer" aria-hidden="true"></div>
        </div>
        <div class="wheel-lower">
          <div class="wheel-legend" id="wheelLegend" aria-hidden="true">${wheelLegendMarkup()}</div>
          <section class="wheel-panel" id="wheelPanel">${wheelPanelMarkup()}</section>
        </div>
        <p class="sr-only" id="wheelLive" aria-live="polite"></p>
      </div>
    </section>`;
  }

  // T14.2: the reading window names what sits under the pointer; after a landing it also marks the winner
  function setWheelWindow(label, name) {
    $('#wheelWindowLabel').textContent = t(lang(), label);
    $('#wheelWindowName').textContent = name;
  }
  function syncWheelWindow() {
    if (!wheelLineup) return setWheelWindow('wheel_first', t(lang(), 'wheel_pick_below'));
    const index = wheelResult ? wheelResultIndex : sectorAtAngle(wheelRotation, 12);
    setWheelWindow(wheelResult ? 'wheel_landed' : 'wheel_under', localText(wheelLineup[index].sector));
    if (!wheelResult) return;
    const stage = $('#wheelStage');
    $('#wheelWin').setAttribute('d', wheelSectorPath(wheelResultIndex, 12, 48.4));
    stage.querySelectorAll(`[data-sector="${wheelResultIndex}"],[data-label="${wheelResultIndex}"]`).forEach(el => el.classList.add('win'));
    stage.classList.add('wheel-landed');
  }

  // Fas 4: the account folds into one row. Native <details> keeps it keyboard- and reader-friendly;
  // accountOpen carries the open state across re-renders (sign-in, language).
  function accountSection() {
    const who = fbUser ? `<span class="account-who">${esc(fbUser.email || fbUser.displayName || '')}</span>` : '';
    return `<details class="account" id="account"${accountOpen ? ' open' : ''}>
      <summary><span>${esc(t(lang(), 'settings_sync'))}${who}</span><span class="account-chevron" aria-hidden="true">›</span></summary>
      <div id="accBody">${accountBody()}</div>
    </details>`;
  }

  function accountBody() {
    const error = '<p id="accError" class="warn" role="status" aria-live="polite" aria-atomic="true" hidden></p>';
    if (fbUser) {
      const providers = fbUser.providerData.map(p => p.providerId);
      const linkGoogle = providers.includes('google.com') ? '' : `<p><button data-acc="link-google">${esc(t(lang(), 'account_link_google'))}</button></p>`;
      const pwForm = providers.includes('password') ? '' : `<form id="pwForm" class="account-form">
        <label>${esc(t(lang(), 'account_create_password'))} <input type="password" id="accNewPw" minlength="6" maxlength="64" autocomplete="new-password" aria-describedby="accError" required></label>
        <p>${esc(t(lang(), 'account_share_hint'))}</p>
        <button type="submit">${esc(t(lang(), 'account_create_password'))}</button>
      </form>`;
      return `<p>${esc(t(lang(), 'account_signed_in_as'))} ${esc(fbUser.email || fbUser.displayName || '')}</p>
      ${linkGoogle}${pwForm}
      <div class="account-actions">
        <button data-acc="signout">${esc(t(lang(), 'account_signout'))}</button>
        <button data-acc="delete">${esc(t(lang(), 'account_delete'))}</button>
      </div>
      <p><a href="info.html#${lang()}">${esc(t(lang(), 'account_legal'))}</a></p>
      ${error}
      <dialog class="confirm-dialog" id="accDelete" aria-labelledby="accDeleteTitle">
        <h2 id="accDeleteTitle">${esc(t(lang(), 'account_delete_title'))}</h2>
        <p>${esc(t(lang(), 'account_delete_confirm'))}</p>
        <div class="account-actions">
          <button data-acc="delete-cancel" autofocus>${esc(t(lang(), 'account_cancel'))}</button>
          <button class="danger" data-acc="delete-confirm">${esc(t(lang(), 'account_delete'))}</button>
        </div>
      </dialog>`;
    }
    const emailField = `<label>${esc(t(lang(), 'account_email'))} <input type="email" id="accEmail" value="${esc(accountEmail)}" autocomplete="username" aria-describedby="accError" required></label>`;
    if (accountMode === 'forgot') return `<form id="forgotForm" class="account-form">
        <h3>${esc(t(lang(), 'account_forgot_title'))}</h3>
        <p>${esc(t(lang(), 'account_forgot_hint'))}</p>
        ${emailField}
        <div class="account-actions">
          <button type="submit" class="account-primary">${esc(t(lang(), 'account_forgot_send'))}</button>
          <button type="button" data-acc-mode="login">${esc(t(lang(), 'fav_back'))}</button>
        </div>
      </form>${error}`;
    const register = accountMode === 'register';
    const modeBtn = (mode, on) => `<button type="button" data-acc-mode="${mode}" aria-pressed="${on}">${esc(t(lang(), mode === 'login' ? 'account_login' : 'account_register'))}</button>`;
    return `<p>${esc(t(lang(), 'account_hint'))}</p>
      <button class="gsi" data-acc="google"><svg class="gsi-logo" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>${esc(t(lang(), 'account_google'))}</button>
      <div class="account-modes" role="group" aria-label="${esc(t(lang(), 'account_title'))}">${modeBtn('login', !register)}${modeBtn('register', register)}</div>
      <form id="emailForm" class="account-form">
        ${emailField}
        <label>${esc(t(lang(), 'account_password'))} <input type="password" id="accPw" minlength="6" maxlength="64" autocomplete="${register ? 'new' : 'current'}-password" aria-describedby="accError" required></label>
        <div class="account-actions">
          <button type="submit" class="account-primary">${esc(t(lang(), register ? 'account_register' : 'account_login'))}</button>
          ${register ? '' : `<button type="button" class="account-link" data-acc-mode="forgot">${esc(t(lang(), 'account_forgot'))}</button>`}
        </div>
      </form>
      <p><a href="info.html#${lang()}">${esc(t(lang(), 'account_legal'))}</a></p>
      ${error}`;
  }

  // Firebase codes in the app's own words; a closed Google popup is the user's choice, not an error
  function showAccountError(err) {
    const el = $('#accError');
    if (!el || (err && err.code === 'auth/popup-closed-by-user')) return;
    const key = authErrorKey(err);
    el.textContent = key ? t(lang(), key) : err.message;
    el.hidden = false;
  }

  function viewSearch() {
    return `<section class="wheel-screen search-screen">
      <header class="wheel-topbar">
        <button class="wheel-back" data-search-act="back">‹ ${esc(t(lang(), 'wheel_back'))}</button>
        <span class="wheel-top-wordmark"><img src="design/wordmark.svg" alt="Sipdeck"></span>
      </header>
      <div class="wheel-body search-body">
        <h1 class="sr-only">${esc(t(lang(), 'search_title'))}</h1>
        <input type="search" id="searchInput" class="search-input" value="${esc(searchQuery)}"
          placeholder="${esc(t(lang(), 'search_placeholder'))}" aria-label="${esc(t(lang(), 'search_placeholder'))}">
        <div id="searchResults">${searchResults()}</div>
      </div>
    </section>`;
  }

  function searchResults() {
    const q = searchQuery.trim();
    const results = db && q
      ? db.drinks.filter(d => matchesSearch(searchHaystack(d, d.ingredients.map(l => ingName(l.id))), q))
      : [];
    const rows = results.map(d => `
      <div class="list-card fav-row">
        <button class="fav-open" data-id="${esc(d.id)}">
          <span class="fav-thumb">${artMarkup(d)}</span>
          <span class="fav-info">
            <span class="name">${esc(d.name)}</span>
            <span class="meta">${esc(taxonomyName('type', d.type))}</span>
          </span>
        </button>
      </div>`).join('');
    return !db ? `<p class="empty">${esc(t(lang(), 'deck_loading'))}</p>`
      : !q ? `<p class="empty">${esc(t(lang(), 'search_intro'))}</p>`
      : results.length ? rows
      : `<p class="empty">${esc(t(lang(), 'search_empty'))}</p>`;
  }

  function wheelOutcomeGroups(s) {
    if (!wheelData || !wheelData.outcomes) return '';
    const excluded = new Set(s.wheelOutcomesExcluded);
    const groups = ['beer-cider', 'wine', 'shot'].map(category => {
      const items = Object.keys(wheelData.outcomes)
        .filter(id => wheelData.outcomes[id].category === category)
        .map(id => `<label class="filter-toggle"><input type="checkbox" data-wheel-outcome="${esc(id)}"${excluded.has(id) ? '' : ' checked'}> <span>${esc(localText(wheelData.outcomes[id].sector))}</span></label>`)
        .join('');
      return items ? `<fieldset class="pantry-group"><legend>${esc(t(lang(), 'wheel_cat_' + category.replace(/-/g, '_')))}</legend><div class="pantry-list">${items}</div></fieldset>` : '';
    }).join('');
    return groups ? `<h2 class="pantry-almost-title">${esc(t(lang(), 'settings_wheel_outcomes_title'))}</h2>${groups}` : '';
  }

  function viewSettings() {
    const s = state.settings;
    loadWheelData();
    return `<h1 class="screen-title">${esc(t(lang(), 'settings_title'))}</h1>
      <dl class="settings">
        <dt>${esc(t(lang(), 'settings_lang'))}</dt><dd><div class="lang-toggle" role="group" aria-label="${esc(t(lang(), 'settings_lang'))}">
          ${['en', 'sv'].map(code => `<button data-lang="${code}"${code === s.lang ? ' class="active" aria-pressed="true"' : ' aria-pressed="false"'}>${esc(t(lang(), 'language_' + code))}</button>`).join('')}
        </div></dd>
        <dt>${esc(t(lang(), 'settings_unit'))}</dt><dd><div class="lang-toggle" role="group" aria-label="${esc(t(lang(), 'settings_unit'))}">
          ${recipeUnits().map(u => `<button data-unit-setting="${u}"${u === unit() ? ' class="active" aria-pressed="true"' : ' aria-pressed="false"'}>${u}</button>`).join('')}
        </div></dd>
      </dl>
      <dl class="settings">
        <dt>${esc(t(lang(), 'settings_wheel_title'))}</dt>
        <dd>
          <label class="filter-toggle"><input type="checkbox" data-settings-act="wheel-favorites-only"${s.wheelFavoritesOnly ? ' checked' : ''}> <span>${esc(t(lang(), 'settings_wheel_favorites_only'))}</span></label>
          <p class="fav-hint">${esc(t(lang(), 'settings_wheel_favorites_only_hint'))}</p>
          <label class="filter-toggle"><input type="checkbox" data-settings-act="wheel-labels"${s.wheelLabels ? ' checked' : ''}> <span>${esc(t(lang(), 'settings_wheel_labels'))}</span></label>
        </dd>
      </dl>
      ${wheelOutcomeGroups(s)}
      ${accountSection()}`;
  }

  function random01() {
    return Math.random();
  }

  function wheelPrefs() {
    return {
      favoritesOnly: state.settings.wheelFavoritesOnly,
      favorites: state.favorites,
      excludedOutcomes: state.settings.wheelOutcomesExcluded,
    };
  }

  // T17: choosing a mood (again) builds a new lineup and patches the drawn wheel in a wave from the
  // pointer, 25 ms per sector. The rotation stays and nothing else is re-rendered.
  function selectWheelMood(index) {
    const mood = wheelData && db && !wheelSpinning && wheelData.moods[index];
    if (!mood) return;
    wheelMoodId = mood.id;
    wheelLineup = buildSpinLineup(wheelData, wheelMoodId, db.drinks, random01, wheelPrefs());
    wheelResult = null;
    wheelPicker = false;
    const stage = $('#wheelStage');
    if (!stage) return;
    const svg = stage.querySelector('svg'), top = sectorAtAngle(wheelRotation, 12);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    stage.classList.remove('wheel-landed');
    stage.querySelectorAll('.win').forEach(el => el.classList.remove('win'));
    svg.classList.remove('wheel-unset');
    svg.setAttribute('aria-label', wheelChoices());
    for (let i = 0; i < 12; i++) {
      const distance = Math.min((i - top + 12) % 12, (top - i + 12) % 12);
      setTimeout(() => {
        const entry = wheelLineup && wheelLineup[i]; // read at patch time, so a quicker second choice always wins
        if (!entry) return;
        stage.querySelector(`.wheel-sector[data-sector="${i}"]`).setAttribute('fill', WHEEL_COLORS[entry.category]);
        stage.querySelector(`.wheel-art[data-sector="${i}"]`).setAttribute('href', entry.art);
        const label = stage.querySelector(`[data-label="${i}"]`);
        if (label) label.textContent = localText(entry.sector);
      }, reduced ? 0 : distance * 25);
    }
    $('#wheelLegend').innerHTML = wheelLegendMarkup();
    $('#wheelPanel').innerHTML = wheelPanelMarkup();
    const hub = $('#wheelHub');
    hub.disabled = false;
    hub.textContent = t(lang(), 'wheel_spin');
    syncWheelWindow();
    $('#wheelLive').textContent = t(lang(), 'wheel_ready');
    hub.focus();
  }

  function closeWheel() {
    if (wheelOpenedFromHome) history.back();
    else {
      history.replaceState(null, '', '#/');
      renderRoute();
    }
  }

  let wheelAudio = null;
  function audioContext() {
    if (wheelMuted) return null;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    try {
      if (!wheelAudio) wheelAudio = new AudioCtx();
      if (wheelAudio.state === 'suspended') {
        const resumed = wheelAudio.resume();
        if (resumed && resumed.catch) resumed.catch(() => {});
      }
      return wheelAudio;
    } catch (err) {
      wheelAudio = null; // sound is optional and must never block a spin
      return null;
    }
  }

  function wheelTone(frequency, duration, volume, delay) {
    const context = audioContext();
    if (!context) return;
    try {
      const start = context.currentTime + (delay || 0);
      const oscillator = context.createOscillator(), gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(Math.max(0.0001, volume), start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(gain); gain.connect(context.destination);
      oscillator.start(start); oscillator.stop(start + duration);
    } catch (err) { /* sound is optional and must never block a spin */ }
  }

  function landingSound() {
    wheelTone(390, .12, .035, 0);
    wheelTone(560, .18, .028, .07);
  }

  // T16: land, pause 150 ms (CSS delay), dim the losers, outline the winner, raise the result card
  function finishWheelSpin(index, end) {
    const mood = wheelMood();
    wheelRotation = end;
    wheelSpinning = false;
    wheelResult = wheelLineup[index];
    wheelResultIndex = index;
    wheelPicker = false;
    if (mood && mood.id === 'shitfaced') wheelLevel5Spins++;
    const disc = $('#wheelDisc');
    if (!disc) return;
    disc.style.transform = `rotate(${end}deg)`;
    syncWheelWindow();
    const hub = $('#wheelHub');
    hub.disabled = false;
    hub.textContent = t(lang(), 'wheel_respin');
    const panel = $('#wheelPanel');
    panel.innerHTML = wheelPanelMarkup();
    panel.querySelector('.wheel-result-art').addEventListener('error', e => { e.currentTarget.hidden = true; }, { once: true });
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const card = $('#wheelResult'), ease = springLinear(.85, 420);
      card.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: 150, easing: ease, fill: 'backwards' });
      card.querySelector('.wheel-result-text').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 210, fill: 'backwards' });
    }
    $('#wheelLive').textContent = localText(wheelResult.result);
    landingSound();
    if (navigator.vibrate) navigator.vibrate(18);
  }

  // T16: runSpin from motion.js. Only transforms are written per frame; no class toggles, no layout reads.
  function spinWheel() {
    const disc = $('#wheelDisc'), pointer = $('#wheelPointer');
    if (wheelSpinning || !wheelLineup || !disc) return;
    const index = selectWheelIndex(wheelLineup, random01);
    if (index < 0) return;
    const spin = ++wheelSpinId, from = wheelRotation, travel = landingTravel(from, index, random01, 12);
    wheelSpinning = true;
    wheelResult = null;
    wheelPicker = false;
    const stage = $('#wheelStage'), name = $('#wheelWindowName');
    stage.classList.remove('wheel-landed');
    stage.querySelectorAll('.win').forEach(el => el.classList.remove('win'));
    $('#wheelPanel').innerHTML = wheelPanelMarkup();
    $('#wheelHub').disabled = true;
    $('#wheelLive').textContent = t(lang(), 'wheel_spinning');
    $('#wheelWindowLabel').textContent = t(lang(), 'wheel_turning');
    audioContext(); // unlock Web Audio from the explicit user gesture
    let last = sectorAtAngle(from, 12), lastTick = -1e9, kick = 0;
    const finish = () => {
      if (spin !== wheelSpinId) return; // already finished, or the visit ended
      wheelSpinId++;
      pointer.style.transform = '';
      finishWheelSpin(index, from + travel);
    };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return void setTimeout(finish, 150);
    const t0 = performance.now();
    const frame = now => {
      if (spin !== wheelSpinId) return;
      const elapsed = now - t0, angle = from + spinAngle(elapsed, travel), sector = sectorAtAngle(angle, 12);
      disc.style.transform = `rotate(${angle}deg)`;
      if (sector !== last) {
        last = sector;
        name.textContent = localText(wheelLineup[sector].sector);
        const speed = Math.abs(spinAngle(elapsed + 8, travel) - spinAngle(elapsed - 8, travel)) / 16 * 1000;
        kick = Math.min(20, 7 + speed * .012);
        if (now - lastTick > 50) { // tick pitch and volume follow the speed, at most ~20 a second
          lastTick = now;
          const k = Math.min(1, speed / 900);
          wheelTone(520 + k * 480, .03, .012 + k * .01, 0);
        }
      }
      kick *= .8;
      pointer.style.transform = `rotate(${kick}deg)`;
      if (elapsed < SPIN_MS) requestAnimationFrame(frame); else finish();
    };
    requestAnimationFrame(frame);
    setTimeout(finish, SPIN_MS + 400); // a background tab pauses rAF, the result still arrives
  }

  // T15: FLIP between the header's mini wheel and the big disc, the same in every browser.
  // Only #wheelDisc flies (its rotation is part of every keyframe); it is measured on #wheelStage.
  function wheelFlip(open) {
    const layer = $('#wheelLayer'), mini = $('#wheelEntry .wheel-symbol'), home = $('.wrap'), disc = $('#wheelDisc');
    const a = mini.getBoundingClientRect(), b = $('#wheelStage').getBoundingClientRect();
    const rot = `rotate(${wheelRotation}deg)`, ez = 'cubic-bezier(.2,0,0,1)';
    const fly = `translate(${a.left + a.width / 2 - b.left - b.width / 2}px,${a.top + a.height / 2 - b.top - b.height / 2}px) scale(${a.width / b.width}) ${rot}`;
    const bg = layer.querySelector('.wheel-bg'), groups = ['.wheel-topbar', '.wheel-window,.wheel-hub-button,.wheel-pointer', '.wheel-lower'];
    const scaled = [{ transform: 'scale(.96)', opacity: .4 }], rest = [{ transform: 'none', opacity: 1 }];
    if (open) {
      mini.style.opacity = '0';
      home.animate(rest.concat(scaled), { duration: 420, easing: ez, fill: 'both' });
      bg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 280 });
      groups.forEach((sel, i) => layer.querySelectorAll(sel).forEach(el => el.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 320, delay: 220 + i * 40, easing: ez, fill: 'backwards' })));
      return disc.animate([{ transform: fly }, { transform: rot }], { duration: 600, easing: springLinear(.8, 600) }).finished
        .then(() => home.getAnimations().forEach(anim => anim.cancel()));
    }
    groups.forEach(sel => layer.querySelectorAll(sel).forEach(el => el.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(4px)' }], { duration: 140, fill: 'forwards' })));
    bg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, delay: 140, fill: 'forwards' });
    home.animate(scaled.concat(rest), { duration: 420, delay: 100, easing: ez, fill: 'backwards' });
    return disc.animate([{ transform: rot }, { transform: fly }], { duration: 480, delay: 60, easing: springLinear(.92, 480), fill: 'forwards' }).finished;
  }

  // ---------- router: hashchange -> coarse re-render per view ----------
  const ROUTES = {
    '#/': { view: viewDeck, match: '#/' },
    '#/hjul': { view: viewWheel, match: null },
    '#/sok': { view: viewSearch, match: null },
    '#/favoriter': { view: viewFavorites, match: '#/favoriter' },
    '#/skafferi': { view: viewPantry, match: '#/skafferi' },
    '#/installningar': { view: viewSettings, match: '#/installningar' },
  };

  function closeFavoriteDetail() {
    favOpenId = null;
    favChecked = new Set();
    if (favHistoryEntry) {
      favHistoryEntry = false;
      history.back();
    } else {
      history.replaceState(null, '', drinkIdFromHash(location.hash) ? '#/' : '#/favoriter');
      render();
    }
  }

  // T18: the entry shows at once and stays inactive until both catalogs have loaded
  function syncWheelEntry() {
    $('#wheelEntry').setAttribute('aria-disabled', String(!(db && wheelData)));
  }

  let lastRouteHash = null, renderedBase = null;
  function render() {
    const hash = location.hash || '#/';
    const detailId = favoriteIdFromHash(hash) || drinkIdFromHash(hash);
    const route = detailId !== null ? ROUTES['#/favoriter'] : (ROUTES[hash] || ROUTES['#/']);
    const isWheel = route.view === viewWheel, layer = $('#wheelLayer');
    const base = isWheel ? viewDeck : route.view; // the wheel is a layer over the deck, which stays in #view
    const keepBase = base === viewDeck && renderedBase === viewDeck && (isWheel || !layer.hidden);
    if (isWheel && !wheelVisitActive) wheelVisitActive = true;
    else if (!isWheel && wheelVisitActive && detailId === null) resetWheelVisit(); // survives fav detail peek
    document.body.classList.toggle('wheel-mode', isWheel);
    document.body.classList.toggle('search-mode', route.view === viewSearch);
    if (route.view !== viewSearch && detailId === null) searchQuery = ''; // survives fav detail peek
    if (route.view !== viewPantry) pantryQuery = '';
    if (route.view === viewFavorites) {
      if (detailId !== favOpenId) favChecked = new Set();
      favOpenId = detailId;
      if (detailId === null) favHistoryEntry = false;
    } else if (favOpenId !== null) {
      favOpenId = null;
      favChecked = new Set();
      favHistoryEntry = false;
    }
    if (!keepBase) {
      $('#view').innerHTML = base();
      if (base === viewDeck && db) mountDeck();
      if (base === viewFavorites || base === viewSearch) $('#view').querySelectorAll('.cocktail-art').forEach(wireArt);
      if (base === viewSearch && matchMedia('(pointer: fine)').matches) $('#searchInput').focus();
      if ($('#pantrySearch')) filterPantry();
      renderedBase = base === viewDeck && !db ? null : base; // a loading deck is redrawn once the data lands
      // page change: only when the route changes, never on a re-render within one. The wheel keeps the
      // deck (keepBase), so opening and closing it never gets here. Search is a fixed overlay inside
      // #view, and a transform would become its containing block, so it only fades.
      if (lastRouteHash !== null && hash !== lastRouteHash && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        $('#view').animate(base === viewSearch ? [{ opacity: 0 }, { opacity: 1 }]
          : [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 160, easing: 'cubic-bezier(.2,0,0,1)' });
      }
    }
    layer.hidden = !isWheel;
    layer.innerHTML = isWheel ? viewWheel() : '';
    if (isWheel) syncWheelWindow();
    else {
      $('#wheelEntry .wheel-symbol').style.opacity = '';
      $('.wrap').getAnimations().forEach(anim => anim.cancel());
    }
    $('#view').inert = $('header.brand').inert = $('#nav').inert = isWheel;
    if (hash !== lastRouteHash) { // announce the new screen once per route change, never per re-render
      if (lastRouteHash !== null) $('#routeLive').textContent = ((isWheel ? layer : $('#view')).querySelector('h1') || {}).textContent || '';
      lastRouteHash = hash;
    }
    document.documentElement.lang = lang();
    $('#wheelEntryLabel').textContent = t(lang(), 'wheel_entry');
    $('#wheelEntry').setAttribute('aria-label', t(lang(), 'wheel_entry'));
    $('#wheelEntry').hidden = base !== viewDeck;
    syncWheelEntry();
    $('#searchEntry').setAttribute('aria-label', t(lang(), 'search_entry'));
    $('#nav').setAttribute('aria-label', t(lang(), 'nav_label'));
    updateNav();
    document.querySelectorAll('#nav a').forEach(a => {
      a.classList.toggle('active', a.dataset.match === route.match);
      if (a.dataset.match === route.match) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  // labels plus the favorites counter (T8); called on every favorites change without a render()
  function updateNav() {
    const navLabels = { '#/': 'nav_deck', '#/favoriter': 'nav_favorites', '#/skafferi': 'nav_pantry', '#/installningar': 'nav_settings' };
    document.querySelectorAll('#nav a').forEach(a => {
      a.textContent = t(lang(), navLabels[a.dataset.match]);
      if (a.dataset.match === '#/favoriter' && state.favorites.length) {
        a.insertAdjacentHTML('beforeend', ` <span class="nav-count">${state.favorites.length}</span>`);
      }
    });
  }

  // T15: opening and closing the wheel FLIP from and to the mini wheel; reduced motion gets a 150 ms fade
  function renderRoute() {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches, layer = $('#wheelLayer');
    const opening = layer.hidden && location.hash === '#/hjul';
    if (!layer.hidden && location.hash !== '#/hjul') {
      layer.inert = true;
      const home = (location.hash || '#/') === '#/' && !reduced;
      const done = () => { layer.inert = false; render(); };
      (home ? wheelFlip(false) : layer.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150, fill: 'forwards' }).finished).then(done, done);
      return;
    }
    render();
    if (!opening || layer.hidden) return;
    if (reduced || renderedBase !== viewDeck) layer.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150 });
    else wheelFlip(true);
  }

  $('#view').addEventListener('click', async e => {
    const modeBtn = e.target.closest('[data-acc-mode]');
    if (modeBtn) { // switch login / register / forgot in place; the typed email carries over
      accountEmail = $('#accEmail').value;
      accountMode = modeBtn.dataset.accMode;
      $('#accBody').innerHTML = accountBody();
      ($('#accBody [aria-pressed="true"]') || $('#accEmail')).focus();
      return;
    }
    const accBtn = e.target.closest('[data-acc]');
    if (accBtn) {
      const action = accBtn.dataset.acc, dialog = $('#accDelete');
      if (action === 'delete') return dialog.showModal();
      if (action === 'delete-cancel' || action === 'delete-confirm') dialog.close();
      if (action === 'delete-cancel') return;
      try {
        await ensureFirebase();
        if (action === 'google') {
          localStorage.setItem(AUTH_KEY, '1');
          await fb.signInWithPopup(fb.auth, new fb.GoogleAuthProvider());
        }
        else if (action === 'link-google') { await fb.linkWithPopup(fbUser, new fb.GoogleAuthProvider()); render(); }
        else if (action === 'signout') await fb.signOut(fb.auth);
        else if (action === 'delete-confirm') {
          deletingAccount = true;
          clearTimeout(pushTimer);
          if (pushPromise) await pushPromise;
          const user = fbUser;
          const res = await authedFetch('/account', { method: 'DELETE' });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Kunde inte radera synkad data.');
          localStorage.removeItem(syncKey(user.uid));
          await user.delete();
        }
      } catch (err) {
        showAccountError(err);
      } finally {
        deletingAccount = false;
      }
      return;
    }
    const langBtn = e.target.closest('[data-lang], [data-unit-setting]');
    if (langBtn) {
      if (langBtn.dataset.lang) state.settings.lang = langBtn.dataset.lang;
      else state.settings.unit = langBtn.dataset.unitSetting;
      save();
      render();
      const again = $('#view').querySelector(langBtn.dataset.lang ? `[data-lang="${lang()}"]` : `[data-unit-setting="${unit()}"]`);
      if (again) again.focus(); // the re-render replaced the pressed button
      return;
    }
    const deckBtn = e.target.closest('[data-deck]');
    if (deckBtn) {
      const card = $('#deck .card[data-depth="0"]');
      if (card && !card.dataset.leaving) flyOff(card, Number(deckBtn.dataset.deck), 0);
      return;
    }
    const chipBtn = e.target.closest('[data-chip]');
    if (chipBtn) {
      const f = state.settings.filters, name = chipBtn.dataset.chip;
      if (name === 'all') { f.bar = false; f.base = null; makeableOnly = false; }
      else if (name === 'bar') f.bar = !f.bar;
      else if (name === 'makeable') makeableOnly = !makeableOnly;
      deckQueue = null;
      flippedId = null;
      save();
      render();
      return;
    }
    if (e.target.closest('#favClose')) { closeFavoriteDetail(); return; }
    if (e.target.closest('[data-search-act="back"]')) { history.back(); return; }
    const favAction = e.target.closest('[data-fav-act]');
    if (favAction) {
      const s = state.settings;
      const input = $('#view [data-servings]');
      if (favAction.dataset.favAct === 'inc') setServings(favOpenId, Number(input.value) + 1);
      else if (favAction.dataset.favAct === 'dec') setServings(favOpenId, Number(input.value) - 1);
      else if (favAction.dataset.favAct === 'unit') { s.unit = favAction.dataset.unit; save(); }
      refreshRecipes();
      return;
    }
    const copyBtn = e.target.closest('[data-copy-fav]');
    if (copyBtn) {
      const drink = favDrink();
      try {
        await copyText(drinkAsText(drink, db.ingredients, servingsFor(drink.id), unit(), lang()));
        copyBtn.textContent = t(lang(), 'copied');
      } catch (err) {
        copyBtn.textContent = t(lang(), 'copy_failed');
      }
      setTimeout(() => { if (copyBtn.isConnected) copyBtn.textContent = t(lang(), 'copy_recipe'); }, 2500);
      return;
    }
    const favBtn = e.target.closest('[data-act="fav"]');
    if (favBtn) {
      const id = favBtn.dataset.id;
      const index = state.favorites.indexOf(id);
      if (index >= 0) {
        state.favorites.splice(index, 1);
        showToast(t(lang(), 'toast_removed'), () => {
          if (!state.favorites.includes(id)) state.favorites.splice(index, 0, id);
          save();
          render();
        });
      } else state.favorites.push(id);
      save();
      render();
      return;
    }
    const row = e.target.closest('.fav-open');
    if (row) {
      favHistoryEntry = true;
      location.hash = '#/favoriter/' + encodeURIComponent(row.dataset.id);
    }
  });

  $('#view').addEventListener('submit', async e => {
    const form = e.target.closest('#emailForm, #pwForm, #forgotForm');
    if (!form) return;
    e.preventDefault();
    const errEl = $('#accError');
    errEl.hidden = true;
    const email = form.id === 'pwForm' ? '' : $('#accEmail').value.trim();
    try {
      await ensureFirebase();
      if (form.id === 'pwForm') { await fb.updatePassword(fbUser, $('#accNewPw').value); render(); }
      else if (form.id === 'forgotForm') {
        await fb.sendPasswordResetEmail(fb.auth, email);
        errEl.textContent = t(lang(), 'account_forgot_sent');
        errEl.hidden = false;
      }
      else if (accountMode === 'register') await fb.createUserWithEmailAndPassword(fb.auth, email, $('#accPw').value);
      else await fb.signInWithEmailAndPassword(fb.auth, email, $('#accPw').value);
    } catch (err) {
      showAccountError(err);
    }
  });

  // <details> toggle does not bubble, so listen in the capture phase
  $('#view').addEventListener('toggle', e => { if (e.target.id === 'account') accountOpen = e.target.open; }, true);

  $('#view').addEventListener('change', e => {
    const control = e.target.closest('[data-servings]');
    if (!control) return;
    setServings(control.dataset.id, control.value);
    refreshRecipes();
  });

  $('#view').addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.matches('[data-servings]')) {
      e.preventDefault();
      e.target.blur();
    }
  });

  $('#view').addEventListener('change', e => {
    const control = e.target.closest('[data-fav-ing]');
    if (!control) return;
    if (control.checked) favChecked.add(control.dataset.favIng);
    else favChecked.delete(control.dataset.favIng);
    control.closest('.fav-ing-row').classList.toggle('done', control.checked);
  });

  $('#view').addEventListener('change', e => {
    const control = e.target.closest('[data-filter]');
    if (!control) return;
    if (control.dataset.filter === 'bar') state.settings.filters.bar = control.checked;
    if (control.dataset.filter === 'base') state.settings.filters.base = control.value || null;
    if (control.dataset.filter === 'makeable') makeableOnly = control.checked;
    deckQueue = null;
    flippedId = null;
    save();
    render();
  });

  $('#view').addEventListener('change', e => {
    const control = e.target.closest('[data-pantry]');
    if (!control) return;
    const id = control.dataset.pantry;
    if (control.checked && !state.pantry.includes(id)) state.pantry.push(id);
    if (!control.checked) state.pantry = state.pantry.filter(item => item !== id);
    deckQueue = null;
    save();
    $('#pantryCount').textContent = pantryCountText();
    $('#pantryAlmost').innerHTML = pantryAlmostMarkup();
  });

  $('#view').addEventListener('change', e => {
    const control = e.target.closest('[data-settings-act^="wheel-"]');
    if (!control) return;
    state.settings[control.dataset.settingsAct === 'wheel-labels' ? 'wheelLabels' : 'wheelFavoritesOnly'] = control.checked;
    save();
  });

  $('#view').addEventListener('change', e => {
    const control = e.target.closest('[data-wheel-outcome]');
    if (!control) return;
    const id = control.dataset.wheelOutcome;
    const excluded = state.settings.wheelOutcomesExcluded;
    if (!control.checked && !excluded.includes(id)) excluded.push(id);
    if (control.checked) state.settings.wheelOutcomesExcluded = excluded.filter(item => item !== id);
    save();
  });

  $('#view').addEventListener('input', e => {
    if (e.target.id === 'pantrySearch') {
      pantryQuery = e.target.value;
      filterPantry();
    }
    const control = e.target.closest('#searchInput');
    if (!control) return;
    searchQuery = control.value;
    const list = $('#searchResults'); // T13: the input is never replaced, so focus and caret stay put
    list.innerHTML = searchResults();
    list.querySelectorAll('.cocktail-art').forEach(wireArt);
  });

  $('#wheelLayer').addEventListener('click', e => {
    const mood = e.target.closest('[data-wheel-mood]');
    if (mood) return selectWheelMood(Number(mood.dataset.wheelMood));
    const recipe = e.target.closest('.fav-open');
    if (recipe) {
      favHistoryEntry = true;
      location.hash = '#/favoriter/' + encodeURIComponent(recipe.dataset.id);
      return;
    }
    const action = e.target.closest('[data-wheel-act]');
    const act = action && action.dataset.wheelAct;
    if (act === 'spin') spinWheel();
    else if (act === 'back') closeWheel();
    else if (act === 'change') { // show the picker again in the result card's place
      wheelPicker = true;
      $('#wheelPanel').innerHTML = wheelPanelMarkup();
      $('#wheelPanel [aria-pressed="true"]').focus();
    } else if (act === 'sound') {
      wheelMuted = !wheelMuted;
      action.textContent = t(lang(), wheelMuted ? 'wheel_sound_off' : 'wheel_sound_on');
      action.setAttribute('aria-pressed', String(!wheelMuted));
    }
  });
  $('#wheelEntry').addEventListener('click', e => {
    if (e.currentTarget.getAttribute('aria-disabled') === 'true') e.preventDefault();
    else wheelOpenedFromHome = true;
  });
  if (localStorage.getItem(AUTH_KEY) === '1') ensureFirebase().catch(() => {});
  window.addEventListener('hashchange', renderRoute);
  window.addEventListener('keydown', e => {
    const dir = swipeDirectionForKey(e.key);
    if (!dir || e.defaultPrevented || e.repeat || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const target = e.target instanceof Element ? e.target : null;
    if (target && target.closest('button, input, select, textarea, a, [contenteditable="true"]')) return;
    if (!$('#wheelLayer').hidden) return; // the deck under the wheel layer never swipes
    const card = $('#deck .card[data-depth="0"]');
    if (!card || card.dataset.leaving) return;
    e.preventDefault();
    flyOff(card, dir, 0);
  });
  render();
})();
