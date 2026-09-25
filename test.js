'use strict';
// ponytail: plain node asserts, no framework. `node test.js` to run.
const fs = require('fs');
const path = require('path');
const { STRINGS, t, detectLang, defaultState, normalizeState, favoriteIdFromHash, drinkIdFromHash,
  scaleMl, normalizeServingCount, MAX_SERVINGS, convert, roundForUnit, formatNumber, formatOz, formatAmount, shuffle, advanceQueue,
  swipeDirectionForKey,
  formatLineAmount, drinkAsText,
  BASE_FILTERS, matchesFilters, canMake, filterDrinks, groupFamilies, deckCards, variantDiff, missingIngredients, mergeState, reconcileState,
  searchHaystack, matchesSearch, ingredientCounts, authErrorKey, AUTH_ERRORS,
  weightedSampleUnique, wheelCocktailWeight, buildSpinLineup, selectWheelIndex,
  wheelSectorPath, springLinear, SPIN_SLOW, SPIN_FAST, SLOW_SPINS, spinMs, spinAngle, landingTravel, sectorAtAngle, WHEEL_COLORS,
  GLASS_SILHOUETTES, glassPlaceholder,
  WHEEL_EXTRAS, wheelExcludedOutcomes, CUSTOM_GLASSES, CUSTOM_COLORS, slugify, buildCustomDrink, similarDrink, mergeCustom } = require('./app.js');
// node 22.12+ loads the Worker's ES module with require(); the same rules guard the catalog below
const { drinkErrors, GLASSES, COLORS, QTY_UNITS: RULE_UNITS } = require('./worker/drink-rules.js');

let pass = 0, fail = 0;
function check(cond, msg) {
  if (cond) { pass++; } else { fail++; console.error('FAIL: ' + msg); }
}

// ---------- app.js pure functions ----------
check(detectLang('sv-SE') === 'sv', 'detectLang: sv-SE -> sv');
check(detectLang('en-US') === 'en', 'detectLang: en-US -> en');
check(detectLang(undefined) === 'en', 'detectLang: missing -> en');
check(Object.values(STRINGS.sv).every(value => !String(value).includes('—')), 'string table sv: no em-dashes');
check(Object.keys(STRINGS.en).every(key => key in STRINGS.sv), 'string table: every English key has Swedish copy');
check(Object.keys(STRINGS.sv).every(key => key in STRINGS.en), 'string table: every Swedish key has English copy');
check(t('sv', 'language_sv') === 'Svenska' && t('en', 'language_sv') === 'Swedish',
  'string table: language labels translate');

const d = defaultState('sv');
check(d.v === 1 && d.settings.lang === 'sv' && d.settings.unit === 'cl' && d.settings.servings === 1,
  'defaultState: shape + lang passthrough');
check(Array.isArray(d.favorites) && d.favorites.length === 0, 'defaultState: empty favorites');
check(d.settings.wheelFavoritesOnly === false, 'defaultState: wheel favorites-only off by default');
check(Array.isArray(d.settings.wheelExtras) && d.settings.wheelExtras.length === 0,
  'defaultState: beer, wine and shots are off in the wheel by default (opt-in)');

// normalizeState round-trip: a valid blob comes back unchanged in shape
const valid = { v: 1, favorites: ['margarita'], pantry: ['gin'],
  settings: { lang: 'en', unit: 'oz', servings: 4, filters: { bar: true, base: 'gin' } } };
const rt = normalizeState(valid, 'sv');
check(rt.favorites.length === 1 && rt.favorites[0] === 'margarita', 'normalizeState: favorites survive');
check(rt.settings.unit === 'oz' && rt.settings.servings === 4, 'normalizeState: settings survive');
check(rt.settings.filters.bar === true && rt.settings.filters.base === 'gin', 'normalizeState: filters survive');

const validWithWheelPrefs = Object.assign({}, valid, { settings: Object.assign({}, valid.settings,
  { wheelFavoritesOnly: true, wheelExtras: ['shot', 42, 'water', 'wine'] }) });
const rtWheelPrefs = normalizeState(validWithWheelPrefs, 'sv');
check(rtWheelPrefs.settings.wheelFavoritesOnly === true, 'normalizeState: wheel favorites-only survives');
check(rtWheelPrefs.settings.wheelExtras.join() === 'shot,wine',
  'normalizeState: wheel extras survive, anything but beer-cider/wine/shot is dropped');
check(normalizeState({ settings: { wheelLabels: true } }, 'en').settings.wheelLabels === true &&
  normalizeState({ settings: { wheelLabels: 'yes' } }, 'en').settings.wheelLabels === false &&
  defaultState('en').settings.wheelLabels === false,
  'normalizeState: wheel sector labels are off by default and only true survives');
check(normalizeState({ settings: { wheelExtras: 'not-an-array' } }, 'en').settings.wheelExtras.length === 0,
  'normalizeState: garbage wheelExtras falls back to empty');

// normalizeState never throws on garbage, falls back to defaults
check((() => { try { return normalizeState('garbage', 'en').v === 1; } catch (e) { return false; } })(),
  'normalizeState: garbage input never throws');
check((() => { try { return normalizeState(null, 'en').settings.lang === 'en'; } catch (e) { return false; } })(),
  'normalizeState: null input falls back to nav lang');
check(normalizeState({ settings: { servings: 101 } }, 'en').settings.servings === 1,
  'normalizeState: out-of-range servings falls back to 1');
check(!('wheel' in normalizeState({ wheel: { mood: 'fresh' } }, 'en')),
  'normalizeState: wheel visit state never enters the persisted blob');

check(favoriteIdFromHash('#/favoriter/margarita') === 'margarita',
  'favoriteIdFromHash: parses favorite detail route');
check(favoriteIdFromHash('#/favoriter/corpse%20reviver') === 'corpse reviver',
  'favoriteIdFromHash: decodes route id');
check(favoriteIdFromHash('#/favoriter') === null,
  'favoriteIdFromHash: favorite list is not a detail route');
check(favoriteIdFromHash('#/favoriter/bad/id') === null,
  'favoriteIdFromHash: nested route is rejected');

check(drinkIdFromHash('#/drink/margarita') === 'margarita',
  'drinkIdFromHash: parses deep-link route (BACKLOG 16)');
check(drinkIdFromHash('#/drink/corpse%20reviver') === 'corpse reviver',
  'drinkIdFromHash: decodes route id');
check(drinkIdFromHash('#/drink') === null, 'drinkIdFromHash: bare prefix is not a detail route');
check(drinkIdFromHash('#/drink/bad/id') === null, 'drinkIdFromHash: nested route is rejected');
check(drinkIdFromHash('#/favoriter/margarita') === null, 'drinkIdFromHash: does not match favorite route');

// ---------- unit engine (BACKLOG 3) ----------
// scaling
check(scaleMl(45, 4) === 180, 'scaleMl: 45 x 4 = 180');
check(scaleMl(45, 1) === 45, 'scaleMl: servings lower bound 1');
check(scaleMl(45, 100) === 4500, 'scaleMl: servings upper bound 100');
check(MAX_SERVINGS === 100 && normalizeServingCount(20) === 20,
  'serving input: accepts a directly entered batch of 20');
check(normalizeServingCount(0) === 1 && normalizeServingCount(101) === 100 &&
  normalizeServingCount('bad') === 1,
  'serving input: clamps invalid and out-of-range values');
check((2 * 3) === 6, 'dash scaling: 2 dashes x 3 = 6 (qty x servings)');

// conversion + rounding
check(roundForUnit(convert(45, 'cl'), 'cl') === 4.5, 'convert+round: 45 ml -> 4,5 cl');
check(roundForUnit(convert(45, 'oz'), 'oz') === 1.5, 'convert+round: 45 ml -> 1.5 oz (1½)');
check(roundForUnit(convert(50, 'oz'), 'oz') === 1.75, 'convert+round: 50 ml -> 1.75 oz (1¾, 50/30=1.667 rounds up)');
check(roundForUnit(convert(22, 'ml'), 'ml') === 20, 'convert+round: 22 ml stays ml, rounds to nearest 5 -> 20');
check(roundForUnit(convert(180, 'cl'), 'cl') === 18, 'convert+round: 180 ml -> 18 cl');

// oz vulgar fractions
check(formatOz(1.5, 'en') === '1' + '½', 'formatOz: 1.5 -> 1½');
check(formatOz(1.75, 'en') === '1' + '¾', 'formatOz: 1.75 -> 1¾');
check(formatOz(2.25, 'en') === '2' + '¼', 'formatOz: 2.25 -> 2¼');
check(formatOz(0.75, 'en') === '¾', 'formatOz: 0.75 -> ¾ (no leading 0)');
check(formatOz(2, 'en') === '2', 'formatOz: whole number has no fraction glyph');

// sv vs en number formatting
check(formatNumber(4.5, 'sv') === '4,5', 'formatNumber sv: decimal comma');
check(formatNumber(4.5, 'en') === '4.5', 'formatNumber en: decimal point');
check(formatNumber(1500, 'sv') === '1 500', 'formatNumber sv: space thousands separator');
check(formatNumber(1500, 'en') === '1,500', 'formatNumber en: comma thousands separator');
check(formatNumber(20, 'sv') === '20', 'formatNumber sv: whole number has no decimal tail');
check(!formatNumber(1500.5, 'sv').includes('—'), 'formatNumber sv: never an em-dash');

// top-level formatAmount: convertible lines
check(formatAmount({ ml: 45, essential: true }, 1, 'cl', 'sv') === '4,5 cl', 'formatAmount: 45 ml -> 4,5 cl (sv)');
check(formatAmount({ ml: 45, essential: true }, 1, 'oz', 'en') === '1½ oz', 'formatAmount: 45 ml -> 1½ oz');
check(formatAmount({ ml: 50, essential: true }, 1, 'oz', 'en') === '1¾ oz', 'formatAmount: 50 ml -> 1¾ oz');
check(formatAmount({ ml: 22, essential: true }, 1, 'ml', 'en') === '20 ml', 'formatAmount: 22 ml x1 -> 20 ml');
check(formatAmount({ ml: 45, essential: true }, 4, 'cl', 'sv') === '18 cl', 'formatAmount: scaling before rounding (45x4=180ml -> 18 cl)');

// non-convertible passthrough: never converts regardless of active display unit
check(formatAmount({ qty: 2, unit: 'dash', essential: false }, 3, 'cl', 'en') === '6 dash',
  'formatAmount: 2 dashes x 3 servings = 6 dash, unaffected by cl unit');
check(formatAmount({ qty: 2, unit: 'dash', essential: false }, 3, 'oz', 'en') === '6 dash',
  'formatAmount: non-convertible passthrough unaffected by oz unit');
check(formatAmount({ qty: 1, unit: 'barspoon', essential: false }, 1, 'ml', 'en') === '1 barspoon',
  'formatAmount: 1 barspoon x1 stays integer');
check(formatAmount({ qty: 1, unit: 'piece', essential: false }, 3, 'cl', 'en') === '3 piece',
  'formatAmount: qty x servings stays integer when it divides evenly');
check(formatAmount({ qty: 1, unit: 'dash', essential: false }, 3, 'cl', 'en').includes('.') === false,
  'formatAmount: integer scaled qty has no decimal tail');
check(formatLineAmount({ qty: 1, unit: 'dash' }, 2, 'cl', 'sv') === '2 stänk',
  'formatLineAmount: translates non-convertible unit');
check(formatLineAmount({ qty: 1, unit: 'barspoon' }, 1, 'oz', 'en') === '1 barspoon (0.5 cl)',
  'formatLineAmount: barspoon includes cl equivalent in English');
check(formatLineAmount({ qty: 2, unit: 'barspoon' }, 2, 'ml', 'sv') === '4 barsked (2 cl)',
  'formatLineAmount: barspoon and cl equivalent scale in Swedish');
check(formatLineAmount({ qty: 1, unit: 'top' }, 4, 'oz', 'sv') === 'toppa upp',
  'formatLineAmount: top renders without quantity');

const copyDrink = {
  name: 'Testdrink',
  ingredients: [{ id: 'gin', ml: 45 }, { id: 'lime', qty: 1, unit: 'slice' }],
  method: { en: 'Stir and serve.', sv: 'Rör och servera.' },
};
const copyIngredients = { gin: { en: 'Gin', sv: 'Gin' }, lime: { en: 'Lime', sv: 'Lime' } };
check(drinkAsText(copyDrink, copyIngredients, 2, 'cl', 'sv') === [
  'Testdrink', '', '2 portioner', '', 'Ingredienser',
  '- 9 cl Gin', '- 2 skiva Lime', '', 'Gör så här', 'Rör och servera.',
].join('\n'), 'drinkAsText: readable Swedish recipe with scaled amounts');
check(drinkAsText(copyDrink, copyIngredients, 1, 'oz', 'en').includes('- 1½ oz Gin'),
  'drinkAsText: uses active English unit formatting');
check(!drinkAsText(copyDrink, copyIngredients, 2, 'cl', 'sv').includes('—'),
  'drinkAsText: Swedish copy contains no em-dash');

// ---------- shuffle (BACKLOG 4) ----------
const orig = [1, 2, 3, 4];
const shuffled = shuffle(orig, () => 0.5); // deterministic rng
check(orig.join() === '1,2,3,4', 'shuffle: does not mutate input');
check(shuffled.length === 4 && [1, 2, 3, 4].every(n => shuffled.includes(n)),
  'shuffle: same members, same length');
check(shuffle([], () => 0.5).length === 0, 'shuffle: empty array ok');
check(shuffle(['a']).join() === 'a', 'shuffle: single element ok');
const queue = ['a', 'b', 'c'];
check(advanceQueue(queue, false).join() === 'b,c,a', 'advanceQueue: skip moves top to back');
check(advanceQueue(queue, true).join() === 'b,c', 'advanceQueue: save removes top for this cycle');
check(queue.join() === 'a,b,c', 'advanceQueue: does not mutate live queue input');
check(advanceQueue([], false).length === 0, 'advanceQueue: empty queue stays empty');

// ---------- filters (BACKLOG 6) ----------
const filterSeed = [
  { id: 'a', base: 'gin', bar: true },
  { id: 'b', base: 'rum', bar: false },
  { id: 'c', base: 'mezcal', bar: true },
];
check(matchesFilters(filterSeed[0], { bar: false, base: null }), 'filters: no filters matches');
check(!matchesFilters(filterSeed[1], { bar: true, base: null }), 'filters: bar excludes non-bar drink');
check(matchesFilters(filterSeed[0], { bar: true, base: 'gin' }), 'filters: bar and base combine');
check(!matchesFilters(filterSeed[1], { bar: false, base: 'gin' }), 'filters: base excludes other spirits');
check(matchesFilters(filterSeed[2], { bar: false, base: 'other' }), 'filters: other matches unlisted base');
check(filterDrinks(filterSeed, { bar: true, base: null }).length === 2, 'filterDrinks: returns matching set');
check(filterDrinks(filterSeed, { bar: true, base: 'rum' }).length === 0, 'filterDrinks: empty combination');
check(filterDrinks(null, {}).length === 0, 'filterDrinks: invalid input is empty');

// ---------- search (#/sok) ----------
const searchDrink = { name: 'Margarita' };
const searchHay = searchHaystack(searchDrink, ['Blanco tequila', 'Triple sec', 'Lime juice']);
check(searchHay === 'margarita blanco tequila triple sec lime juice', 'searchHaystack: name + ingredients, lowercased');
check(matchesSearch(searchHay, 'MARGA'), 'matchesSearch: case-insensitive name match');
check(matchesSearch(searchHay, 'tequila'), 'matchesSearch: ingredient match');
check(matchesSearch(searchHay, '  '), 'matchesSearch: blank query matches everything');
check(matchesSearch(searchHay, ''), 'matchesSearch: empty query matches everything');
check(!matchesSearch(searchHay, 'vodka'), 'matchesSearch: no match rejects');

// ---------- F1 variants ----------
check(searchHaystack({ name: "Tommy's Margarita", aliases: ['tommys'], variantLabel: { en: "Tommy's", sv: "Tommy's" } }, [])
  .includes('tommys'), 'searchHaystack: aliases and variant label are searchable');
const famDrinks = [
  { id: 'm', family: 'f', bar: true, base: 'tequila', ingredients: [{ id: 'teq', ml: 50 }, { id: 'sec', ml: 20 }, { id: 'lime', ml: 15 }] },
  { id: 't', family: 'f', bar: false, base: 'tequila', ingredients: [{ id: 'teq', ml: 60 }, { id: 'agave', ml: 30 }, { id: 'lime', ml: 15 }] },
  { id: 'solo', bar: true, base: 'gin', ingredients: [{ id: 'gin', ml: 50 }] },
];
const famMap = { f: { name: 'F', primary: 'm', order: ['m', 't'] } };
check(groupFamilies(famDrinks).length === 2, 'groupFamilies: a family is one group, a standalone drink its own');
check(deckCards(famDrinks, famMap, {}, null, []).join() === 'm,solo', 'deckCards: one card per family, the primary by default');
check(deckCards(famDrinks, famMap, {}, null, ['t']).join() === 't,solo', 'deckCards: a saved variant represents its family');
check(deckCards(famDrinks, famMap, { bar: true }, null, ['t']).join() === 'm,solo',
  'deckCards: the only member that passes the filters wins over a saved one');
check(deckCards(famDrinks, famMap, { base: 'gin' }, null, []).join() === 'solo', 'deckCards: a family with no passing member drops out');
const famDiff = variantDiff(famDrinks[1], famDrinks[0]);
check(famDiff.added.join() === 'agave' && Object.keys(famDiff.changed).join() === 'teq' && famDiff.changed.teq.ml === 50 &&
  famDiff.removed.map(line => line.id).join() === 'sec', 'variantDiff: new, changed (with the primary amount) and removed lines');
check(variantDiff(famDrinks[0], famDrinks[0]).added.length === 0 && variantDiff(famDrinks[0], null).removed.length === 0,
  'variantDiff: the primary itself has no diff');

// ---------- F2 own drinks + F3 suggestions ----------
const customIngredients = { bourbon: { en: 'Bourbon', sv: 'Bourbon' }, 'lemon-juice': { en: 'Lemon juice', sv: 'Citronjuice' },
  flader: { en: 'Fläder', sv: 'Fläder', custom: true } };
const built = buildCustomDrink({ id: 'egen-abc', name: ' Kvällens sour ', glass: 'coupe', color: 'citrus', method: 'Skaka hårt.',
  source: 'Egen skapelse', lines: [
    { amount: '5', unit: 'cl', name: 'bourbon' }, { amount: '2.5', unit: 'cl', name: 'Citronjuice' },
    { amount: '', unit: 'garnish', name: 'Äppelskiva' }, { amount: '1', unit: 'oz', name: 'Fläder' }, { amount: '3', unit: 'cl', name: '  ' },
  ] }, customIngredients);
check(drinkErrors(built).length === 0, 'buildCustomDrink: the form result passes the Worker rules');
check(built.name === 'Kvällens sour' && built.custom === true && built.bar === false && built.method.en === 'Skaka hårt.',
  'buildCustomDrink: trimmed name, own marker, never bar-audited');
check(built.ingredients.length === 4, 'buildCustomDrink: empty rows are dropped');
check(built.ingredients[0].id === 'bourbon' && built.ingredients[0].ml === 50 && !('label' in built.ingredients[0]) &&
  built.ingredients[1].id === 'lemon-juice' && built.ingredients[1].ml === 25,
  'buildCustomDrink: names in either language map to catalog ids, cl becomes ml');
check(built.ingredients[2].id === 'appelskiva' && built.ingredients[2].label === 'Äppelskiva' &&
  built.ingredients[2].unit === 'garnish' && built.ingredients[2].qty === 1 && built.ingredients[2].essential === false,
  'buildCustomDrink: free text keeps its label, garnish is optional');
check(built.ingredients[3].id === 'flader' && built.ingredients[3].label === 'Fläder' && built.ingredients[3].ml === 30,
  'buildCustomDrink: an earlier free-text name is not taken for a catalog ingredient');
check(built.source.label === 'Egen skapelse' && !('url' in built.source) &&
  buildCustomDrink({ id: 'egen-x', name: 'X', glass: 'rocks', color: 'red', method: 'M', source: 'https://example.com/r', lines: [] }, {}).source.url === 'https://example.com/r',
  'buildCustomDrink: source is a label, a https link also becomes the url');
check(slugify('Äppel  Juice!') === 'appel-juice' && slugify('***') === '', 'slugify: accents folded, kebab-case');
check(CUSTOM_GLASSES.length === 8 && Object.keys(CUSTOM_COLORS).length === 6 &&
  CUSTOM_GLASSES.every(g => GLASSES.includes(g) && GLASS_SILHOUETTES[g]) && Object.keys(CUSTOM_COLORS).join() === COLORS.join(),
  'custom form: 8 glasses × 6 colours, all known to the rules and drawn as silhouettes');
check(Object.keys(GLASS_SILHOUETTES).sort().join() === GLASSES.slice().sort().join(), 'drink rules: glass list matches the silhouettes');
check(drinkErrors(Object.assign({}, built, { ingredients: [{ id: 'gin', ml: 50, qty: 1, unit: 'dash', essential: true }] })).length === 1 &&
  drinkErrors(Object.assign({}, built, { ingredients: [{ id: 'gin', qty: 1, unit: 'bucket', essential: true }] })).length === 1 &&
  drinkErrors(Object.assign({}, built, { name: '' })).join() === 'name' && drinkErrors(null).length === 1,
  'drink rules: ml xor qty+unit, unit set, name and shape');
const simCatalog = [
  { id: 'whiskey-sour', ingredients: [{ id: 'bourbon', essential: true }, { id: 'lemon-juice', essential: true }, { id: 'sugar-syrup', essential: true }, { id: 'egg-white', essential: false }] },
  { id: 'old-fashioned', ingredients: [{ id: 'bourbon', essential: true }, { id: 'sugar', essential: true }, { id: 'bitters', essential: true }] },
];
const simOwn = { id: 'egen-1', ingredients: [{ id: 'bourbon', essential: true }, { id: 'lemon-juice', essential: true },
  { id: 'sugar-syrup', essential: true }, { id: 'flader', essential: true }, { id: 'mint', essential: false }] };
const sim = similarDrink(simOwn, simCatalog);
check(sim && sim.drink.id === 'whiskey-sour' && sim.shared === 3 && sim.all === 4 && sim.score === 0.75,
  'similarDrink: Jaccard on essential ids, 3 of 4 in common');
check(similarDrink({ id: 'egen-2', ingredients: [{ id: 'bourbon', essential: true }, { id: 'lemon-juice', essential: true }, { id: 'x', essential: true }, { id: 'y', essential: true }] }, simCatalog) === null,
  'similarDrink: below 0,6 is no match (2 of 5 = 0,4)');
check(similarDrink({ id: 'e', ingredients: [{ id: 'bourbon', essential: true }, { id: 'lemon-juice', essential: true }, { id: 'x', essential: true }] },
  [{ id: 'three', ingredients: [{ id: 'bourbon', essential: true }, { id: 'lemon-juice', essential: true }, { id: 'y', essential: true }, { id: 'z', essential: true }] }]) === null &&
  similarDrink({ id: 'e', ingredients: simCatalog[0].ingredients }, [{ id: 'mine', custom: true, ingredients: simCatalog[0].ingredients }]) === null &&
  similarDrink({ id: 'e', ingredients: [{ id: 'a', essential: true }, { id: 'b', essential: true }, { id: 'c', essential: true }] },
    [{ id: 'p', ingredients: [{ id: 'a', essential: true }, { id: 'b', essential: true }, { id: 'c', essential: true }, { id: 'd', essential: true }, { id: 'e', essential: true }] }]).score === 0.6,
  'similarDrink: exactly 0,6 counts, 2 of 5 does not, own drinks are never the match');
const merged2 = mergeCustom([{ id: 'a', drink: { n: 1 }, updatedAt: 5 }, { id: 'b', drink: { n: 2 }, updatedAt: 9 }],
  [{ id: 'a', drink: null, updatedAt: 7 }, { id: 'b', drink: { n: 3 }, updatedAt: 8 }, { id: 'c', drink: { n: 4 }, updatedAt: 1 }]);
check(merged2.length === 3 && merged2.find(e => e.id === 'a').drink === null && merged2.find(e => e.id === 'b').drink.n === 2 &&
  merged2.find(e => e.id === 'c').drink.n === 4, 'mergeCustom: newer edit wins per drink, a newer deletion too, new ones join');
check(['en', 'sv'].every(l => Object.keys(CUSTOM_COLORS).every(c => t(l, 'color_' + c) !== 'color_' + c) &&
  ['new', 'accepted', 'published', 'declined'].every(s => t(l, 'suggest_status_' + s) !== 'suggest_status_' + s)),
  'i18n: colour names and every suggestion status in EN + SV');
check(RULE_UNITS.join() === ['dash', 'barspoon', 'teaspoon', 'drop', 'piece', 'leaf', 'slice', 'garnish', 'splash', 'top'].join(),
  'drink rules: the same qty units as the catalog validator');

check(swipeDirectionForKey('ArrowLeft') === -1, 'keyboard swipe: left skips');
check(swipeDirectionForKey('ArrowRight') === 1, 'keyboard swipe: right saves');
check(swipeDirectionForKey('Enter') === 0, 'keyboard swipe: unrelated keys are ignored');

// ---------- spinning wheel ----------
const wheelData = JSON.parse(fs.readFileSync(path.join(__dirname, 'wheel.json'), 'utf8'));
const wheelFixture = Array.from({ length: 10 }, (_, i) => ({
  id: `drink-${i}`, name: `Drink ${i}`, bar: true,
  tags: i < 3 ? ['strong'] : [],
}));
const sampleSource = ['a', 'b', 'c'];
const sample = weightedSampleUnique(sampleSource, 2, () => 1, () => 0);
check(sample.join() === 'a,b', 'wheel weighted sample: deterministic unique picks');
check(sampleSource.join() === 'a,b,c', 'wheel weighted sample: does not mutate source');
check(wheelCocktailWeight(wheelFixture[0], { strongWeight: 2 }) === 2,
  'wheel cocktail weight: strong mood multiplier');
check(wheelCocktailWeight(wheelFixture[0], { strongWeight: 0 }) === 0,
  'wheel cocktail weight: strong cocktails can be excluded');
check(wheelCocktailWeight({ bar: false, tags: [] }, { strongWeight: 2 }) === 0,
  'wheel cocktail weight: non-bar cocktail never qualifies');

const lineups = Object.fromEntries(wheelData.moods.map(mood => [
  mood.id, buildSpinLineup(wheelData, mood.id, wheelFixture, () => 0.2),
]));
Object.entries(lineups).forEach(([mood, lineup]) => {
  check(lineup.length === 12, `wheel lineup ${mood}: exactly 12 visible sectors`);
});
check(lineups.fresh.filter(item => item.category === 'shot').length === 3,
  'wheel lineup fresh: three shot sectors');
check(lineups.fresh.filter(item => item.category === 'bottle').length === 1,
  'wheel lineup fresh: bottle appears when flex draw is below one third');
check(lineups.groove.filter(item => item.category === 'shot').length === 2,
  'wheel lineup groove: two shot sectors');
check(lineups.tipsy.filter(item => item.category === 'shot').length === 1,
  'wheel lineup tipsy: one shot sector');
check(lineups.wobbly.every(item => item.category !== 'shot'),
  'wheel lineup wobbly: no shot sectors');
check(lineups.wobbly.filter(item => item.category === 'water').length === 2,
  'wheel lineup wobbly: water is introduced with two sectors');
check(lineups.wobbly.filter(item => item.kind === 'cocktail').every(item =>
  !wheelFixture.find(drink => drink.id === item.outcomeId).tags.includes('strong')),
  'wheel lineup wobbly: strong-tagged cocktails excluded');
check(lineups.shitfaced.filter(item => item.category === 'water').length === 7,
  'wheel lineup shitfaced: seven visible water sectors');
check(lineups.shitfaced.filter(item => item.eligible === false).length === 5,
  'wheel lineup shitfaced: five visible non-water decoys');
check(lineups.shitfaced[selectWheelIndex(lineups.shitfaced, () => 0.99)].category === 'water',
  'wheel selection shitfaced: forced result always chooses water');
check(lineups.groove[selectWheelIndex(lineups.groove, () => 0.99)].eligible,
  'wheel selection normal mood: selected visible sector is eligible');

// wheel prefs: favorites-only cocktails + per-outcome beer/wine/shot exclusion
const favEnough = ['drink-0', 'drink-1', 'drink-2', 'drink-3', 'drink-4']; // groove needs 5 cocktail slots
const lineupFavEnough = buildSpinLineup(wheelData, 'groove', wheelFixture, () => 0.5,
  { favoritesOnly: true, favorites: favEnough });
check(lineupFavEnough.length === 12, 'wheel prefs: favorites-only keeps 12 sectors when favorites suffice');
check(lineupFavEnough.filter(item => item.kind === 'cocktail').every(item => favEnough.includes(item.outcomeId)),
  'wheel prefs: favorites-only draws only favorited cocktails when there are enough');

const favTooFew = ['drink-0', 'drink-1']; // groove needs 5, only 2 favorited
const lineupFavTooFew = buildSpinLineup(wheelData, 'groove', wheelFixture, () => 0.5,
  { favoritesOnly: true, favorites: favTooFew });
const cocktailIdsTooFew = lineupFavTooFew.filter(item => item.kind === 'cocktail').map(item => item.outcomeId);
check(lineupFavTooFew.length === 12, 'wheel prefs: favorites-only tops up to 12 sectors when favorites are too few');
check(new Set(cocktailIdsTooFew).size === cocktailIdsTooFew.length,
  'wheel prefs: favorites-only top-up never repeats a cocktail to avoid the gap');
check(favTooFew.every(id => cocktailIdsTooFew.includes(id)),
  'wheel prefs: favorites-only top-up still includes every favorite that fits');

const lineupNoPrefs = buildSpinLineup(wheelData, 'groove', wheelFixture, () => 0.5);
const lineupFavZero = buildSpinLineup(wheelData, 'groove', wheelFixture, () => 0.5,
  { favoritesOnly: true, favorites: [] });
check(JSON.stringify(lineupFavZero) === JSON.stringify(lineupNoPrefs),
  'wheel prefs: favorites-only with zero favorites behaves exactly like the toggle being off');

const shotIds = Object.keys(wheelData.outcomes).filter(id => wheelData.outcomes[id].category === 'shot');
const lineupNoShots = buildSpinLineup(wheelData, 'fresh', wheelFixture, () => 0.99, { excludedOutcomes: shotIds });
check(lineupNoShots.length === 12, 'wheel prefs: excluding a whole category never breaks the lineup');
check(lineupNoShots.every(item => item.category !== 'shot'),
  'wheel prefs: excluding every shot outcome removes the category entirely');
check(lineupNoShots.filter(item => item.kind === 'cocktail').length === 9,
  'wheel prefs: slots freed by an excluded category fall back to extra cocktails');
{
  const cats = ids => new Set(ids.map(id => wheelData.outcomes[id].category));
  const none = cats(wheelExcludedOutcomes(wheelData, []));
  check(['beer-cider', 'wine', 'bottle', 'shot'].every(c => none.has(c)) && !none.has('water') && !none.has('red-bull'),
    'wheel extras: by default beer, wine, the bottle and shots are excluded; water and Red Bull stay');
  const wine = cats(wheelExcludedOutcomes(wheelData, ['wine']));
  check(!wine.has('wine') && !wine.has('bottle') && wine.has('shot'), 'wheel extras: wine brings the bottle with it');
  check(wheelExcludedOutcomes(wheelData, WHEEL_EXTRAS).length === 0, 'wheel extras: all on excludes nothing');
  // fresh with the flex draw under a third wants the bottle; with wine off it must still be 12 sectors
  const lineupBarOnly = buildSpinLineup(wheelData, 'fresh', wheelFixture, () => 0, { excludedOutcomes: wheelExcludedOutcomes(wheelData, []) });
  check(lineupBarOnly.length === 12 && lineupBarOnly.every(item => item.kind === 'cocktail'),
    'wheel extras: default fresh wheel is 12 bar cocktails, the bottle slot falls back too');
  const shitfaced = buildSpinLineup(wheelData, 'shitfaced', wheelFixture, () => 0.5, { excludedOutcomes: wheelExcludedOutcomes(wheelData, []) });
  check(shitfaced.length === 12 && shitfaced.some(item => item.outcomeId === 'water' && item.eligible),
    'wheel extras: level 5 still lands on water by default');
}
{
  // 8 of 16 drinks are one family; without the family rule about half the cocktail sectors would be members
  const wheelFam = Array.from({ length: 16 }, (_, i) => Object.assign({ id: `drink-${i}`, name: `Drink ${i}`, bar: true, tags: [] },
    i < 8 ? { family: 'fam' } : {}));
  const members = seed => {
    let x = seed;
    const rng = () => (x = (x * 16807) % 2147483647) / 2147483647;
    return buildSpinLineup(wheelData, 'groove', wheelFam, rng).filter(item => /^drink-[0-7]$/.test(item.outcomeId)).length;
  };
  check([1, 2, 3, 4, 5, 6, 7, 8].every(seed => members(seed) <= 1), 'wheel lineup: a family counts as one outcome');
  const favLineup = buildSpinLineup(wheelData, 'groove', wheelFam, () => 0.5, { favoritesOnly: true, favorites: ['drink-3'] });
  check(favLineup.some(item => item.outcomeId === 'drink-3'), 'wheel lineup: a saved variant represents its family');
}

for (const [from, index, r] of [[17, 4, 0.5], [0, 0, 0], [123.4, 11, 0.999], [-40, 7, 0.2]]) {
  const end = from + landingTravel(from, index, () => r, 12);
  const endFast = from + landingTravel(from, index, () => r, 12, SPIN_FAST);
  check(endFast - from >= 3 * 360 && endFast - from < 4 * 360 && sectorAtAngle(endFast, 12) === index,
    `wheel landing ${index}: a quick spin makes three turns and still lands in the sector`);
  check(end - from >= 4 * 360 && end - from < 5 * 360, `wheel landing ${index}: four full turns plus under one`);
  check(sectorAtAngle(end, 12) === index, `wheel landing ${index}: finishes inside the selected sector`);
  const centre = ((-end % 360) + 360) % 360, off = Math.abs((((centre - index * 30) + 540) % 360) - 180);
  check(off <= 10.2 + 1e-9, `wheel landing ${index}: keeps a safe margin from the sector edges`);
}
{
  // T16: one continuous curve per profile, no velocity jumps, lands exactly on the travel
  for (const [profile, travels] of [[SPIN_SLOW, [1440, 1620, 1799]], [SPIN_FAST, [1080, 1260, 1439]]]) {
    let maxJump = 0, prev = null;
    for (const travel of travels) {
      for (let t = 0; t <= spinMs(profile); t += 1) {
        const v = (spinAngle(t + 0.5, travel, profile) - spinAngle(t - 0.5, travel, profile)) * 1000;
        if (t > 0 && prev !== null) maxJump = Math.max(maxJump, Math.abs(v - prev));
        prev = v;
      }
      check(Math.abs(spinAngle(spinMs(profile), travel, profile) - travel) < 1e-9 && spinAngle(spinMs(profile) + 500, travel, profile) === travel,
        `wheel spin ${profile.main} ms, ${travel}°: rests exactly on the travel`);
      prev = null;
    }
    check(maxJump < 10, `wheel spin ${profile.main} ms: speed is continuous (largest change per ms ${maxJump.toFixed(2)}°/s)`);
  }
  // owner 2026-09-25: the first spins crawl through the last sectors, spammed spins are quick
  const lastSectors = ms => 1620 - spinAngle(spinMs(SPIN_SLOW) - SPIN_SLOW.settle - ms, 1620, SPIN_SLOW);
  check(lastSectors(2000) > 150 && lastSectors(1000) > 25, `wheel spin slow: still passing sectors near the end (${Math.round(lastSectors(2000))}° in the last 2 s)`);
  check(spinMs(SPIN_SLOW) > 5500 && spinMs(SPIN_FAST) < 3000 && SLOW_SPINS === 3, 'wheel spin: three slow spins of about 6 s, then about 2,5 s');
  check(springLinear(0.8, 600).startsWith('linear(0.0000,') && springLinear(0.8, 600).endsWith(',1)'),
    'wheel spring: CSS linear() easing starts at 0 and rests at 1');
  check(Object.keys(WHEEL_COLORS).length === 7, 'wheel colours: one per outcome category');
}
check(wheelSectorPath(0, 12).startsWith('M50 50L'), 'wheel SVG: sector path starts at hub');
check(wheelSectorPath(0, 12) !== wheelSectorPath(1, 12), 'wheel SVG: adjacent sector paths differ');

const appSource = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
const htmlSource = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const infoSource = fs.readFileSync(path.join(__dirname, 'info.html'), 'utf8');
const workerSource = fs.readFileSync(path.join(__dirname, 'worker', 'worker.js'), 'utf8');
// budget bumped 60kB -> 65kB 2026-07-20 for BACKLOG 15 (accounts+sync, Firebase Auth + Worker/D1 client)
// bumped 65kB -> 67kB 2026-07-20 for BACKLOG 18 (email+password sign-in)
// bumped 67kB -> 68kB 2026-07-20 for BACKLOG 19 (account linking: add Google/password to an existing account)
// bumped 68kB -> 70kB 2026-07-20 for pantry-missing badges/highlighting + pull-merge bugfix
// bumped 70kB -> 71kB 2026-07-21 for deck-card pantry-missing chips/ingredient list (favorites parity)
// bumped 71kB -> 74kB 2026-07-21 for catalog search (#/sok: name+ingredient search, deep-links into detail view)
// bumped 74kB -> 79kB 2026-07-21 for wheel prefs (favorites-only cocktails, per-outcome beer/wine/shot toggles)
// bumped 86kB -> 87kB 2026-07-23 for transient editable 1–100 recipe servings
// bumped 87kB -> 89kB 2026-07-24 for keyboard-safe card faces and accessible status semantics
// bumped 89kB -> 90kB 2026-09-25 for design review batch 1 (missing status only with a pantry, route announcements)
// bumped 90kB -> 97kB 2026-09-25 for design review batch 2 (deck buttons, undo toast, filter chips, segmented recipe controls, in-place updates)
// bumped 97kB -> 99kB 2026-09-25 for design review batch 3 part 1 (wheel motion: spinAngle, landingTravel, springLinear)
// bumped 99kB -> 104kB 2026-09-25 for design review batch 3 (wheel layer, FLIP, runSpin, mood buttons, result card, wave patch)
// bumped 104kB -> 113kB 2026-09-25 for design review batch 4 (pantry search/count, account modes, forgot step, delete dialog, auth error copy)
// bumped 113kB -> 120kB 2026-09-25 for design review batch 5 (F1 variants: family deck/wheel units, variant switch, diff, grouped search)
// bumped 120kB -> 140kB 2026-09-25 for design review batch 6 (F2 own-drink form, local store + per-drink sync, F3 similarity
// check, suggestion form and status; about 6,5 kB of it is the new EN + SV copy)
// Mät LF-storleken, alltså det git lagrar och GitHub Pages levererar. En Windows-
// arbetskopia checkas ut med CRLF och lägger på ~1,8 kB som aldrig deployas.
check(Buffer.byteLength(appSource.split('\r').join('')) < 140000,
  'bundle budget: app.js stays under 140 kB unminified');
check(!htmlSource.includes('fonts.googleapis.com') && htmlSource.includes("fonts/work-sans.woff2"),
  'privacy: fonts are self-hosted with no Google Fonts request');
check(htmlSource.includes('rel="canonical" href="https://buildapp.se/sipdeck/"') &&
  infoSource.includes('rel="canonical" href="https://buildapp.se/sipdeck/info.html"'),
  'seo: public HTML pages declare their canonical URLs');
const headersSource = fs.readFileSync(path.join(__dirname, '_headers'), 'utf8');
check(headersSource.includes('X-Content-Type-Options: nosniff') &&
  headersSource.includes("frame-ancestors 'none'") &&
  headersSource.includes('Permissions-Policy: camera=(), microphone=(), geolocation=()'),
  'hosting: static responses declare the safe project-scoped security headers');
check(appSource.includes('el.inert = depth !== 0') &&
  appSource.includes("e.key !== 'Enter' && e.key !== ' '") &&
  appSource.includes('aria-describedby="accError"'),
  'accessibility: hidden cards leave the tab order, keyboard flips work and account errors are associated');
check(!htmlSource.includes('gstatic.com/firebase') && appSource.includes("async function ensureFirebase()"),
  'privacy: Firebase is lazy-loaded only by account use or remembered sign-in');
check(appSource.includes("const AUTH_KEY = KEY + '-auth'") && appSource.includes("signInWithPopup") &&
  !appSource.includes("signInWithRedirect"),
  'privacy: requested account persistence resumes lazy auth with cross-origin-safe sign-in');
check(appSource.split('href="info.html#${lang()}"').length === 3,
  'privacy: legal information is linked for signed-in and signed-out account views');
check(appSource.split('data-servings').length >= 5 && appSource.includes('max="${MAX_SERVINGS}"') &&
  appSource.includes('if (servingDrinkId !== id)'),
  'recipe scaling: deck and favorite views accept 1–100 and another drink resets to 1');
check(htmlSource.includes('.servings-input::-webkit-inner-spin-button') &&
  htmlSource.includes('-moz-appearance:textfield'),
  'recipe scaling: native number spinners stay hidden beside the larger minus/plus controls');
const settingsViewSource = appSource.slice(appSource.indexOf('function viewSettings()'),
  appSource.indexOf('function random01()'));
// fas 4: the unit is a real control in settings (data-unit-setting); deck filters stay on the deck
check(settingsViewSource.includes('data-unit-setting') &&
  !settingsViewSource.includes("settings_filter_bar')") &&
  !settingsViewSource.includes("settings_filter_base')"),
  'settings: unit is a control, deck-filter summaries are not duplicated');
check(settingsViewSource.indexOf('accountSection()') < settingsViewSource.indexOf('settings_lang'),
  'settings: the folded account comes first (owner 2026-09-25, overrides the review spec)');
check(!appSource.includes('confirm(') && appSource.includes('<dialog class="confirm-dialog" id="accDelete"'),
  'account deletion: confirmed in a <dialog>, never window.confirm');
check(authErrorKey({ code: 'auth/wrong-password' }) === 'auth_wrong_password' &&
  authErrorKey({ code: 'auth/email-already-in-use' }) === 'auth_email_already_in_use' &&
  authErrorKey({ code: 'auth/network-request-failed' }) === 'auth_generic' &&
  authErrorKey(new Error('Kunde inte radera synkad data.')) === null,
  'auth errors: known codes map to own copy, other codes to the generic line, app errors keep their text');
check(AUTH_ERRORS.every(code => {
  const key = authErrorKey({ code: 'auth/' + code });
  return STRINGS.en[key] && STRINGS.sv[key];
}), 'auth errors: every mapped code has English and Swedish copy');
const counted = ingredientCounts([
  { ingredients: [{ id: 'gin' }, { id: 'lime-juice' }, { id: 'gin' }] },
  { ingredients: [{ id: 'gin' }] },
]);
check(counted.gin === 2 && counted['lime-juice'] === 1, 'ingredientCounts: counts drinks, not lines');
check(infoSource.includes('Patrik Löfgren') && infoSource.includes('kontakt@orgutveckling.se') &&
  infoSource.includes('id="sv"') && infoSource.includes('id="en"'),
  'legal page: controller, contact and Swedish/English notices are present');
check(infoSource.includes('inga annonserings- eller analyscookies') &&
  infoSource.includes('current D1 database is not locked'),
  'legal page: current storage, analytics and D1 jurisdiction are disclosed');
check(infoSource.includes('sipdeck.custom') && infoSource.includes('Förslag till katalogen') && infoSource.includes('Suggestions to the catalog') &&
  infoSource.includes('redigera och illustrera det i appen') && infoSource.includes('and illustrate it in the app'),
  'legal page (F2/F3): own drinks, suggestion storage, retention and publishing rights in both languages');
['instrument-serif-regular.woff2', 'instrument-serif-italic.woff2', 'work-sans.woff2'].forEach(file => {
  const font = fs.readFileSync(path.join(__dirname, 'fonts', file));
  check(font.subarray(0, 4).toString() === 'wOF2', `self-hosted font: ${file} is valid WOFF2`);
});
check(htmlSource.includes('href="#/hjul"') && appSource.includes("'#/hjul'"),
  'wheel route: starting-page entry and router target are wired');
check(!appSource.includes('startViewTransition') && !htmlSource.includes('view-transition') &&
  !htmlSource.includes('wheel-fallback') && !appSource.includes('nativeWebKit'),
  'wheel transition (T15): no View Transitions branch, engine sniffing or fallback keyframes');
check(appSource.includes('springLinear(.8, 600)') && appSource.includes('springLinear(.92, 480)') &&
  appSource.includes("$('#wheelStage').getBoundingClientRect()"),
  'wheel transition (T15): FLIP opens and closes on springs, measured on the unrotated stage');
check(appSource.includes('const keepBase = base === viewDeck') && htmlSource.includes('<div id="wheelLayer" hidden></div>'),
  'wheel transition (T15): the wheel is a layer over the deck, so closing never cuts to a blank page');
check(appSource.includes("matchMedia('(prefers-reduced-motion: reduce)')") &&
  appSource.includes("layer.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150 })"),
  'wheel accessibility: reduced motion opens with a 150 ms fade and no transform');
check(appSource.includes('aria-live="polite"') && appSource.includes('aria-pressed="${item.id === wheelMoodId}"'),
  'wheel accessibility: result is announced and mood buttons expose their state');
check(appSource.includes('navigator.vibrate(18)') && appSource.includes('wheelMuted = false'),
  'wheel feedback: one landing haptic and visit-local sound default');
check(appSource.includes('sound is optional and must never block a spin') &&
  appSource.includes('wheelAudio = null;'),
  'wheel resilience: unavailable Web Audio cannot block a spin');
check(appSource.includes('setTimeout(finish, total + 400)') && appSource.includes('if (spin !== wheelSpinId) return;'),
  'wheel resilience: a paused rAF still lands, and a finished or abandoned spin never lands twice');
const spinSource = appSource.slice(appSource.indexOf('  function spinWheel()'), appSource.indexOf('  function wheelFlip('));
const frameSource = spinSource.slice(spinSource.indexOf('const frame'), spinSource.indexOf('setTimeout(finish, total'));
check(frameSource.length > 200 && !/classList|getBoundingClientRect|offset(Width|Height)|getComputedStyle/.test(frameSource),
  'wheel spin (T16): the animation frame writes transforms only, no class toggles or layout reads');
check(reconcileState(defaultState('en'), defaultState('en'), Object.assign(defaultState('en'), { settings: Object.assign(defaultState('en').settings, { wheelLabels: true }) })).settings.wheelLabels === true,
  'reconcileState: a remote wheel-labels change wins over an unchanged local one');
check(!appSource.includes('offsetWidth;') && !appSource.includes('getComputedStyle(element).transform'),
  'wheel spin (T16): no forced layout or computed-style reads while spinning');
check(!appSource.includes('default to first mood') && appSource.includes(' class="wheel-unset"'),
  'wheel start (T4): no preselected mood, the wheel starts neutral');
check(!htmlSource.includes('.wheel-action.primary') && appSource.split('data-wheel-act="spin"').length === 2,
  'wheel spin (T14): the hub is the only spin button');
const moodSource = appSource.slice(appSource.indexOf('  function selectWheelMood('), appSource.indexOf('  function closeWheel('));
check(!moodSource.includes('render()') && moodSource.includes('distance * 25'),
  'wheel mood (T17): choosing a mood patches sectors in a 25 ms wave without re-rendering');
check(appSource.includes("act === 'change'") && !appSource.includes("action === 'new'"),
  'wheel mood (T14): "Change mood" brings the picker back; choosing the active mood again is the new wheel');
check(appSource.includes('detailId === null) resetWheelVisit()'),
  'wheel result: spin state survives opening the landed recipe');
check(appSource.includes('`<button class="fav-open" data-id="${esc(entry.outcomeId)}"'),
  'wheel result: landed cocktail links to its recipe detail');
check(htmlSource.includes('<svg class="wheel-symbol" viewBox="0 0 100 100"') &&
  htmlSource.split('class="wheel-sector"').length >= 13,
  'wheel entry: mini symbol is the same twelve-sector disc as the big wheel');
check(appSource.includes('draggable="false"'), 'pointer swipe: artwork disables native image dragging');
// Pointer dragging and native recipe scrolling are exercised in recipe-controls.spec.js.
check(htmlSource.includes('user-select:none;-webkit-user-select:none'), 'pointer swipe: card text selection disabled');
check(appSource.includes("aria-keyshortcuts', 'Enter Space ArrowLeft ArrowRight'"),
  'keyboard card: top card exposes flip and swipe shortcuts');

// ---------- glass placeholders (BACKLOG 9) ----------
['coupe', 'highball', 'rocks', 'martini', 'collins', 'flute', 'goblet', 'hurricane',
  'irish-coffee', 'julep', 'margarita', 'shot', 'wine'].forEach(glass => {
  check(typeof GLASS_SILHOUETTES[glass] === 'string', `glass placeholder: ${glass} silhouette exists`);
  check(glassPlaceholder(glass).includes(`glass-${glass}`), `glass placeholder: ${glass} selects its silhouette`);
});
check(glassPlaceholder('unknown').includes('glass-rocks'), 'glass placeholder: unknown glass degrades to rocks');
check(glassPlaceholder('coupe') !== glassPlaceholder('martini'), 'glass placeholder: coupe and martini differ');

// ---------- pantry + makeable filter (BACKLOG 7) ----------
const pantryDrink = { id: 'pantry-test', base: 'gin', bar: true, ingredients: [
  { id: 'gin', essential: true },
  { id: 'lime-juice', essential: true },
  { id: 'lime-wheel', essential: false },
] };
check(canMake(pantryDrink, ['gin', 'lime-juice']), 'canMake: every essential ingredient present');
check(!canMake(pantryDrink, ['gin']), 'canMake: missing essential ingredient rejects drink');
check(canMake({ ingredients: [{ id: 'garnish', essential: false }] }, []), 'canMake: optional-only drink qualifies');
check(filterDrinks([pantryDrink], { bar: true, base: 'gin' }, ['gin', 'lime-juice']).length === 1,
  'filterDrinks: pantry combines with bar and base');
check(filterDrinks([pantryDrink], { bar: true, base: 'gin' }, []).length === 0,
  'filterDrinks: empty pantry has no makeable drinks');
check(missingIngredients(pantryDrink, ['gin']).length === 1 && missingIngredients(pantryDrink, ['gin'])[0].id === 'lime-juice',
  'missingIngredients: returns the missing essential line');
check(missingIngredients(pantryDrink, ['gin', 'lime-juice']).length === 0,
  'missingIngredients: empty when every essential is present');
check(missingIngredients(pantryDrink, []).length === 2, 'missingIngredients: ignores non-essential lines');

// ---------- sync merge (logged-out edits must never be lost on login) ----------
const localState = { v: 1, favorites: ['margarita'], pantry: ['gin'], settings: { lang: 'sv', unit: 'cl', servings: 1, filters: { bar: false, base: null } } };
const serverState = { v: 1, favorites: ['negroni'], pantry: ['lime-juice'], settings: { lang: 'en', unit: 'oz', servings: 2, filters: { bar: true, base: 'gin' } } };
const merged = mergeState(localState, serverState);
check(merged.favorites.includes('margarita') && merged.favorites.includes('negroni'),
  'mergeState: unions favorites from both sides');
check(merged.pantry.includes('gin') && merged.pantry.includes('lime-juice'),
  'mergeState: unions pantry from both sides');
check(merged.settings === serverState.settings, 'mergeState: settings stay server-wins');
const dedupeMerged = mergeState({ v: 1, favorites: ['margarita'], pantry: [], settings: localState.settings },
  { v: 1, favorites: ['margarita'], pantry: [], settings: serverState.settings });
check(dedupeMerged.favorites.length === 1, 'mergeState: union dedupes shared entries');
const syncBase = normalizeState({
  favorites: ['margarita', 'negroni'], pantry: ['gin'],
  settings: { lang: 'sv', unit: 'cl', servings: 1 },
}, 'sv');
const syncLocal = normalizeState({
  favorites: ['margarita'], pantry: ['gin'],
  settings: { lang: 'sv', unit: 'oz', servings: 1 },
}, 'sv');
const syncRemote = normalizeState({
  favorites: ['margarita', 'negroni', 'daiquiri'], pantry: ['gin', 'lime-juice'],
  settings: { lang: 'en', unit: 'cl', servings: 1 },
}, 'sv');
const reconciled = reconcileState(syncBase, syncLocal, syncRemote);
check(!reconciled.favorites.includes('negroni') && reconciled.favorites.includes('daiquiri'),
  'reconcileState: local removal and independent remote addition both survive');
check(reconciled.pantry.includes('lime-juice'),
  'reconcileState: unchanged local set accepts remote additions');
check(reconciled.settings.unit === 'oz' && reconciled.settings.lang === 'en',
  'reconcileState: local and remote setting edits merge field by field');
check(workerSource.includes('WHERE id = ? AND state = ?') && workerSource.includes("}, 409)"),
  'sync Worker: compare-and-swap rejects stale state writes');
check(appSource.indexOf("authedFetch('/account'") < appSource.indexOf('await user.delete()'),
  'account deletion: D1 wipe is awaited before Firebase deletion');
check(workerSource.includes('allowDeleted = false') && workerSource.includes('deletedAt: Date.now()') &&
  workerSource.includes('Date.now() - 2 * 60 * 60 * 1000'),
  'account deletion: tombstone blocks old tokens and is purged after token expiry');
check(workerSource.includes("DELETE FROM user_drinks WHERE firebase_uid = ?") &&
  workerSource.includes("status IN ('new', 'declined')") && workerSource.includes('SUGGESTIONS_PER_DAY = 5'),
  'account deletion: own drinks and unpublished suggestions go with the account (worker.test.mjs runs it)');
check(appSource.includes("const CUSTOM_KEY = 'sipdeck.custom'") && !('custom' in normalizeState({ custom: [1] }, 'en')),
  'F2: own drinks live under sipdeck.custom, never in the synced state blob');
check(workerSource.includes('!refreshed && Date.now() - jwksMissRefresh') &&
  workerSource.includes('c.iat <= now') && workerSource.includes('c.auth_time <= now'),
  'Firebase verifier: unknown keys refresh once and required time claims are checked');

// ---------- drinks.json validator ----------
const UNITS = ['dash', 'barspoon', 'teaspoon', 'drop', 'piece', 'leaf', 'slice', 'garnish', 'splash', 'top'];
const INGREDIENT_GROUPS = ['spirits', 'liqueurs', 'fresh', 'pantry'];
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'drinks.json'), 'utf8'));
UNITS.forEach(unit => ['en', 'sv'].forEach(lang =>
  check(t(lang, `unit_${unit}`) !== `unit_${unit}`, `unit ${unit}: ${lang} translation present`)));

check(data.schema === 2, 'drinks.json: schema === 2');
check(data.ingredients && typeof data.ingredients === 'object', 'drinks.json: ingredients is a map');
check(Array.isArray(data.drinks), 'drinks.json: drinks is an array');
check(wheelData.schema === 1, 'wheel.json: schema === 1');
check(Array.isArray(wheelData.moods) && wheelData.moods.length === 5,
  'wheel.json: exact five-mood ladder');
check(wheelData.outcomes && Object.keys(wheelData.outcomes).length === 11,
  'wheel.json: exact wheel-only outcome catalog');
check(wheelData.moods.map(mood => mood.id).join() === 'fresh,groove,tipsy,wobbly,shitfaced',
  'wheel.json: canonical mood order');
wheelData.moods.forEach(mood => {
  check(Array.isArray(mood.slots) && mood.slots.length === 12,
    `wheel.json mood ${mood.id}: exactly 12 sector slots`);
  check(mood.name && mood.name.en && mood.name.sv, `wheel.json mood ${mood.id}: EN + SV name`);
  check(mood.copy && mood.copy.en && mood.copy.sv, `wheel.json mood ${mood.id}: EN + SV copy`);
  check(!String(mood.name.sv).includes('â€”') && !String(mood.copy.sv).includes('â€”'),
    `wheel.json mood ${mood.id}: Swedish copy has no em-dash`);
});
check(wheelData.moods.find(mood => mood.id === 'shitfaced').forcedOutcome === 'water',
  'wheel.json: highest mood forces water');
check(wheelData.moods.find(mood => mood.id === 'shitfaced').repeatCopy.length === 2,
  'wheel.json: highest mood has second and third-spin copy');
const wheelArt = new Set();
Object.entries(wheelData.outcomes).forEach(([id, outcome]) => {
  check(outcome.sector && outcome.sector.en && outcome.sector.sv,
    `wheel.json outcome ${id}: short EN + SV sector label`);
  check(outcome.result && outcome.result.en && outcome.result.sv,
    `wheel.json outcome ${id}: full EN + SV result name`);
  check(Array.isArray(outcome.art) && outcome.art.length > 0,
    `wheel.json outcome ${id}: artwork declared`);
  (outcome.art || []).forEach(file => {
    wheelArt.add(file);
    check(/^img-wheel\/[a-z0-9-]+\.webp$/.test(file), `wheel artwork path: ${file}`);
    check(fs.existsSync(path.join(__dirname, file)), `wheel artwork exists: ${file}`);
    const image = fs.readFileSync(path.join(__dirname, file));
    const marker = image.indexOf(Buffer.from([0x9d, 0x01, 0x2a]));
    check(image.toString('ascii', 0, 4) === 'RIFF' && image.toString('ascii', 8, 12) === 'WEBP',
      `wheel artwork format: ${file} is WebP`);
    check(marker >= 0 && (image.readUInt16LE(marker + 3) & 0x3fff) === 512 &&
      (image.readUInt16LE(marker + 5) & 0x3fff) === 512,
    `wheel artwork dimensions: ${file} is 512x512`);
    check(image.length <= 30000, `wheel artwork budget: ${file} is at most 30 kB`);
  });
});
check(wheelArt.size === 13, 'wheel.json: exact 13-image wheel artwork inventory');
['sazerac', 'bees-knees', 'bellini'].forEach(id => {
  const drink = data.drinks.find(item => item.id === id);
  check(drink && drink.bar === false, `bar-ready editorial exception: ${id}`);
});
// BACKLOG 13 strict normal-bar audit: the exact allowlist, per docs/BAR-AUDIT.md.
const BAR_ALLOWLIST = ['amaretto-sour', 'americano', 'aperol-spritz', 'black-russian',
  'bloody-mary', 'blue-lagoon', 'boulevardier', 'caipiroska', 'cosmopolitan', 'cuba-libre',
  'daiquiri', 'dark-n-stormy', 'dry-martini', 'espresso-martini', 'french-connection',
  'gin-and-tonic', 'gin-fizz', 'godfather', 'irish-coffee', 'lemon-drop-martini',
  'long-island-iced-tea', 'lynchburg-lemonade', 'margarita', 'mimosa', 'mint-julep',
  'mojito', 'moscow-mule', 'negroni', 'old-fashioned', 'rob-roy', 'sex-on-the-beach',
  'sidecar', 'southside', 'tequila-sunrise', 'whiskey-sour', 'white-lady', 'white-russian'];
const barIds = data.drinks.filter(drink => drink.bar).map(drink => drink.id).sort();
check(barIds.length === 37, 'bar audit: exactly 37 drinks pass the strict normal-bar bar');
check(barIds.join() === BAR_ALLOWLIST.join(), 'bar audit: allowlist matches docs/BAR-AUDIT.md exactly');
BAR_ALLOWLIST.forEach(id => check(data.drinks.some(drink => drink.id === id && drink.bar === true),
  `bar audit allowlist: ${id} is bar: true`));
new Set(data.drinks.map(drink => drink.type)).forEach(type => {
  const key = 'type_' + type.replace(/-/g, '_');
  check(t('en', key) !== key && t('sv', key) !== key, `i18n: drink type ${type} resolves in EN + SV`);
});
BASE_FILTERS.forEach(base => {
  const key = 'base_' + base;
  check(t('en', key) !== key && t('sv', key) !== key, `i18n: base filter ${base} resolves in EN + SV`);
});

// ---------- installability (BACKLOG 11) ----------
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'manifest.webmanifest'), 'utf8'));
check(manifest.id === './' && manifest.start_url === './' && manifest.scope === './',
  'manifest: subpath-safe relative identity, start and scope');
check(manifest.display === 'standalone', 'manifest: standalone display');
check(manifest.background_color === '#EFE8DB' && manifest.theme_color === '#EFE8DB',
  'manifest: finalized shell colors');
const expectedManifestIcons = new Map([
  ['icons/icon-192.png', '192x192'],
  ['icons/icon-512.png', '512x512'],
  ['icons/icon-maskable-512.png', '512x512'],
]);
check(manifest.icons.length === expectedManifestIcons.size, 'manifest: exact icon set');
manifest.icons.forEach(icon => {
  check(expectedManifestIcons.get(icon.src) === icon.sizes, `manifest: icon declaration ${icon.src}`);
  check(fs.existsSync(path.join(__dirname, icon.src)), `manifest: icon exists ${icon.src}`);
});
check(manifest.icons.find(icon => icon.src === 'icons/icon-maskable-512.png').purpose === 'maskable',
  'manifest: maskable icon purpose');
const expectedPngSizes = new Map([
  ['icons/icon-192.png', 192], ['icons/icon-512.png', 512],
  ['icons/icon-maskable-512.png', 512], ['icons/apple-touch-icon.png', 180],
  ['icons/icon-48.png', 48], ['icons/favicon-32.png', 32], ['icons/favicon-16.png', 16],
]);
expectedPngSizes.forEach((size, file) => {
  const png = fs.readFileSync(path.join(__dirname, file));
  check(png.readUInt32BE(16) === size && png.readUInt32BE(20) === size,
    `icon export: ${file} is ${size}x${size}`);
});
check(htmlSource.includes('rel="manifest" href="manifest.webmanifest"'), 'installability: manifest linked');
check(htmlSource.includes('rel="apple-touch-icon" href="icons/apple-touch-icon.png"'),
  'installability: Apple touch icon linked');
check(!appSource.includes('serviceWorker.register'), 'installability: no v1 service worker');

// every ingredient map key is kebab-case with en+sv
Object.keys(data.ingredients).forEach(id => {
  check(KEBAB.test(id), `ingredient id kebab-case: ${id}`);
  const ing = data.ingredients[id];
  check(typeof ing.en === 'string' && ing.en.length > 0, `ingredient ${id}: en present`);
  check(typeof ing.sv === 'string' && ing.sv.length > 0, `ingredient ${id}: sv present`);
  check(INGREDIENT_GROUPS.includes(ing.group), `ingredient ${id}: group valid`);
  check(!String(ing.sv).includes('—'), `ingredient ${id}: sv has no em-dash`);
});

const seenIds = new Set();
const REQUIRED_FIELDS = ['id', 'name', 'type', 'base', 'iba', 'bar', 'tags', 'glass', 'source', 'ingredients', 'method'];

data.drinks.forEach(drink => {
  REQUIRED_FIELDS.forEach(f => check(f in drink, `drink ${drink.id || '?'}: has field ${f}`));

  check(!seenIds.has(drink.id), `drink id unique: ${drink.id}`);
  seenIds.add(drink.id);

  check(KEBAB.test(drink.id), `drink id kebab-case: ${drink.id}`);
  check(typeof drink.name === 'string' && drink.name.length > 0, `${drink.id}: name is a non-empty string`);
  check(typeof drink.iba === 'boolean', `${drink.id}: iba is boolean`);
  check(typeof drink.bar === 'boolean', `${drink.id}: bar is boolean`);
  check(Array.isArray(drink.tags), `${drink.id}: tags is an array`);
  check(typeof GLASS_SILHOUETTES[drink.glass] === 'string', `${drink.id}: glass has a supported silhouette`);

  check(drink.method && typeof drink.method.en === 'string' && drink.method.en.length > 0,
    `${drink.id}: method.en present`);
  check(drink.method && typeof drink.method.sv === 'string' && drink.method.sv.length > 0,
    `${drink.id}: method.sv present`);
  if (drink.source !== undefined) {
    check(drink.source && typeof drink.source.label === 'string' && drink.source.label.length > 0,
      `${drink.id}: source label present`);
    check(drink.source && /^https:\/\//.test(drink.source.url), `${drink.id}: source is an HTTPS URL`);
  }
  if (drink.method && drink.method.sv) {
    check(!drink.method.sv.includes('—'), `${drink.id}: method.sv has no em-dash`);
  }

  check(drinkErrors(drink).length === 0, `${drink.id}: passes the shared drink rules (${drinkErrors(drink)})`);
  check(Array.isArray(drink.ingredients) && drink.ingredients.length > 0,
    `${drink.id}: ingredients is a non-empty array`);
  (drink.ingredients || []).forEach((line, i) => {
    check(data.ingredients[line.id] !== undefined,
      `${drink.id}[${i}]: ingredient id resolvable (${line.id})`);
    check(typeof line.essential === 'boolean', `${drink.id}[${i}]: essential is boolean (${line.id})`);

    const hasMl = typeof line.ml === 'number';
    const hasQtyUnit = typeof line.qty === 'number' && typeof line.unit === 'string';
    check(hasMl !== hasQtyUnit, `${drink.id}[${i}]: ml xor qty+unit (${line.id})`);
    if (hasQtyUnit) check(UNITS.includes(line.unit), `${drink.id}[${i}]: unit in allowed set (${line.unit})`);
  });
});

// F1: one type spelling, families point at real drinks and every member points back
const TYPES = ['sour', 'highball', 'aromatic', 'spirit-forward', 'contemporary'];
data.drinks.forEach(drink => check(TYPES.includes(drink.type), `${drink.id}: type in allowed set (${drink.type})`));
check(data.families && typeof data.families === 'object', 'drinks.json: families is a map');
const drinkById = new Map(data.drinks.map(drink => [drink.id, drink]));
Object.entries(data.families).forEach(([key, family]) => {
  check(KEBAB.test(key) && typeof family.name === 'string' && family.name.length > 0, `family ${key}: kebab key and a name`);
  check(Array.isArray(family.order) && family.order.length >= 2 && new Set(family.order).size === family.order.length,
    `family ${key}: at least two distinct members`);
  check(family.order.includes(family.primary), `family ${key}: primary is a member`);
  family.order.forEach(id => check(drinkById.has(id) && drinkById.get(id).family === key, `family ${key}: ${id} exists and points back`));
});
data.drinks.forEach(drink => {
  if (drink.family !== undefined) {
    check(data.families[drink.family] && data.families[drink.family].order.includes(drink.id), `${drink.id}: listed in its family`);
    check(drink.variantLabel && typeof drink.variantLabel.en === 'string' && drink.variantLabel.en.length > 0 &&
      typeof drink.variantLabel.sv === 'string' && drink.variantLabel.sv.length > 0 && !drink.variantLabel.sv.includes('—'),
      `${drink.id}: EN + SV variant label`);
  }
  if (drink.aliases !== undefined) check(Array.isArray(drink.aliases) && drink.aliases.every(a => typeof a === 'string' && a === a.toLowerCase()),
    `${drink.id}: aliases are lowercase strings`);
  if (drink.art !== undefined) check(drinkById.has(drink.art), `${drink.id}: art borrows an existing drink's image`);
});

const sourceUrls = data.drinks.map(drink => drink.source.url);
check(new Set(sourceUrls).size === sourceUrls.length, 'drinks.json: every recipe has its own source URL');
check(!sourceUrls.some(url => /recipe\/(854\/gimlet|386\/caipiroska)$/.test(url)),
  'drinks.json: stale Difford source URLs removed');
const dirtyMartini = data.drinks.find(drink => drink.id === 'dirty-martini');
check(dirtyMartini.ingredients.filter(line => line.ml).map(line => line.ml).join() === '60,22.5,15',
  'dirty-martini: source-verified 60/22.5/15 ratio');
const cranberryJack = data.drinks.find(drink => drink.id === 'cranberry-jack');
check(cranberryJack.glass === 'highball' &&
  cranberryJack.ingredients.find(line => line.id === 'lemon-lime-soda').unit === 'top',
  'cranberry-jack: highball is topped with soda without a fixed amount');
const lynchburgLemonade = data.drinks.find(drink => drink.id === 'lynchburg-lemonade');
check(lynchburgLemonade.ingredients.find(line => line.id === 'lemon-lime-soda').ml === 120,
  'lynchburg-lemonade: source keeps its explicit 12 cl soda amount');

console.log(`${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
