// Receptets formregler, delade av Workern (egna drinkar, förslag) och test.js (hela katalogen).
// test.js kör varje drink i drinks.json genom drinkErrors, så en regel här kan aldrig stänga ute katalogen.
export const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const QTY_UNITS = ['dash', 'barspoon', 'teaspoon', 'drop', 'piece', 'leaf', 'slice', 'garnish', 'splash', 'top'];
export const GLASSES = ['coupe', 'highball', 'rocks', 'martini', 'flute', 'shot', 'wine', 'collins', 'goblet',
  'hurricane', 'irish-coffee', 'julep', 'margarita'];
export const COLORS = ['clear', 'citrus', 'red', 'green', 'amber', 'pink'];

const text = (v, max) => typeof v === 'string' && v.trim().length > 0 && v.length <= max;

// [] = giltig. Varje fel är en kort engelsk rad för loggar och test, aldrig för användaren.
export function drinkErrors(drink) {
  if (!drink || typeof drink !== 'object' || Array.isArray(drink)) return ['not an object'];
  const errors = [];
  if (typeof drink.id !== 'string' || !KEBAB.test(drink.id) || drink.id.length > 64) errors.push('id');
  if (!text(drink.name, 80)) errors.push('name');
  if (!GLASSES.includes(drink.glass)) errors.push('glass');
  if (drink.color !== undefined && !COLORS.includes(drink.color)) errors.push('color');
  if (!drink.method || !text(drink.method.en, 2000)) errors.push('method');
  if (drink.method && drink.method.sv !== undefined && !text(drink.method.sv, 2000)) errors.push('method.sv');
  if (drink.tags !== undefined && !(Array.isArray(drink.tags) && drink.tags.every(tag => typeof tag === 'string'))) errors.push('tags');
  if (drink.source !== undefined && !(drink.source && text(drink.source.label, 200) &&
    (drink.source.url === undefined || /^https:\/\/\S+$/.test(drink.source.url)))) errors.push('source');
  if (!Array.isArray(drink.ingredients) || !drink.ingredients.length || drink.ingredients.length > 25) return errors.concat('ingredients');
  drink.ingredients.forEach((line, i) => {
    const ok = line && typeof line.id === 'string' && KEBAB.test(line.id) && line.id.length <= 64 &&
      typeof line.essential === 'boolean' && (line.label === undefined || text(line.label, 60));
    const hasMl = typeof line.ml === 'number', hasQty = typeof line.qty === 'number' || typeof line.unit === 'string';
    const amount = hasMl !== hasQty && (hasMl ? line.ml > 0 && line.ml <= 2000
      : typeof line.qty === 'number' && line.qty > 0 && line.qty <= 100 && QTY_UNITS.includes(line.unit));
    if (!ok || !amount) errors.push(`ingredients[${i}]`);
  });
  return errors;
}
