'use strict';
// En statisk receptsida per katalogdrink: drink/<id>/index.html. Det är dem en delad länk pekar på, och det är
// dem sökmotorer och länkförhandsvisningar (og:/twitter:) kan läsa, eftersom appen själv bara är en hash-route.
// Sidorna är genererade men incheckade, så hostingen förblir "inga byggsteg": kör om skriptet när drinks.json
// eller texterna ändras, test.js säger till om någon sida inte längre stämmer med katalogen.
//   node scripts/drink-pages.js
// Ingen app.js på sidorna: bara inline-CSS, appens två typsnitt och drinkens bild.
const fs = require('fs');
const path = require('path');
const { t, formatLineAmount, formatNumber, similarDrinks } = require('../app.js');
const db = require('../drinks.json');

const BASE = 'https://buildapp.se/sipdeck/';
const ROOT = path.join(__dirname, '..');
const LANG = 'sv';

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const ing = id => (db.ingredients[id] || {})[LANG] || (db.ingredients[id] || {}).en || id;
const tax = (kind, id) => t(LANG, kind + '_' + String(id).replace(/-/g, '_'));
const art = d => `img/${d.art || d.id}.webp`;
const METHOD_TAGS = ['stirred', 'frozen', 'layered'];
const meta = d => [tax('type', d.type), tax('glass', d.glass), ...(d.tags || []).filter(x => METHOD_TAGS.includes(x)).slice(0, 1).map(x => tax('method', x))].join(' · ');
const amount = (l, n) => l.unit === 'garnish' ? formatNumber(l.qty * n, LANG) : formatLineAmount(l, n, 'cl', LANG);
const lineText = (l, n) => `${amount(l, n)} ${ing(l.id)}${l.unit === 'garnish' ? ` (${t(LANG, 'unit_garnish')})` : ''}`;

function description(d) {
  const main = d.ingredients.filter(l => l.essential).map(l => ing(l.id)).join(', ');
  return `Så gör du en ${d.name}: ${main}. ${tax('type', d.type)} i ${tax('glass', d.glass)}, med mått och gör så här.`;
}

const WORDMARK = `<svg viewBox="0 0 254 84" role="img" aria-label="Sipdeck"><g fill="none" stroke="currentColor" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round"><path d="M 27,27.5 C 23.5,22 7.5,21.5 7,29 C 6.5,36.5 27.5,34.5 27,44 C 26.5,52.5 8,52.5 5.5,46"/><path d="M 42,24.5 V 55.75"/><path d="M 56.4,24.5 V 74"/><circle cx="72" cy="40" r="15.75"/><circle cx="114" cy="40" r="15.75"/><path d="M 129.75,6 V 55.75"/><path d="M 167.5,51 A 15.75,15.75 0 1 1 171.75,36.5 H 141"/><path d="M 210,29 A 15.75,15.75 0 1 0 210,51"/><path d="M 224,6 V 55.75"/><path d="M 241,25.5 L 224.5,43.5"/><path d="M 231.5,36.5 L 242,55.75"/></g><circle cx="42" cy="9" r="5.5" fill="var(--accent)"/></svg>`;

// appens tokens (index.html): papper, kort, bläck, vermouthgrönt. Kortet är bildernas papper och byter inte färg i mörkt läge.
const CSS = `@font-face{font-family:'Instrument Serif';font-style:normal;font-weight:400;font-display:swap;src:url('../../fonts/instrument-serif-regular.woff2') format('woff2')}
@font-face{font-family:'Work Sans';font-style:normal;font-weight:400 600;font-display:swap;src:url('../../fonts/work-sans.woff2') format('woff2')}
:root{--bg:#EFE8DB;--card:#FBF7EF;--ink:#211B12;--ink-2:#6E6455;--accent:#2F6B3F;--line:rgba(33,27,18,.14);--top:#211B12;
--display:'Instrument Serif',Georgia,'Times New Roman',serif;color-scheme:light}
@media(prefers-color-scheme:dark){:root{--bg:#17130E;--top:#EDE5D6}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:400 16px/1.55 'Work Sans',system-ui,-apple-system,'Segoe UI',sans-serif;-webkit-text-size-adjust:100%}
a{color:var(--accent);text-underline-offset:2px}
header,main,footer{width:min(100% - 32px,960px);margin:0 auto}
header{padding:18px 0 14px;color:var(--top)}header a{display:inline-block;color:inherit}header svg{width:104px;height:auto;display:block}
article{background:var(--card);border-radius:20px;box-shadow:0 1px 2px rgba(33,27,18,.06),0 12px 32px -12px rgba(33,27,18,.25);overflow:hidden}
figure{margin:0;padding:20px 20px 0;display:flex;justify-content:center}
figure img{width:min(100%,260px);height:auto;aspect-ratio:4/5;display:block;border-radius:14px}
.recipe{padding:8px 24px 28px}
h1{font:400 clamp(2.5rem,9vw,3.5rem)/1.02 var(--display);margin:0 0 6px;letter-spacing:-.01em}
.meta{color:var(--ink-2);margin:0 0 20px;font-size:.95rem}
h2{font-size:1.05rem;font-weight:600;margin:24px 0 8px}
ul{list-style:none;margin:0;padding:0;border-top:1px solid var(--line);display:grid;grid-template-columns:minmax(3.5em,max-content) 1fr;column-gap:14px}
li{grid-column:1/-1;display:grid;grid-template-columns:subgrid;padding:11px 0;border-bottom:1px solid var(--line);align-items:baseline}
li b{font-weight:600;text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
li small{color:var(--ink-2);font-size:.8rem;margin-left:6px}
.serves{color:var(--ink-2);font-size:.9rem;margin:-4px 0 10px}
.method{font-size:1.06rem;margin:0}
.source{font-size:.85rem;color:var(--ink-2);margin:12px 0 0}.source a{color:inherit}
.open{display:inline-flex;align-items:center;gap:8px;margin:24px 0 0;padding:13px 22px;min-height:48px;border-radius:999px;background:var(--accent);color:#FBF7EF;font-weight:600;text-decoration:none}
.open:hover{background:#24522F}.open:focus-visible,.more a:focus-visible{outline:3px solid var(--accent);outline-offset:3px}
.more{margin-top:32px}
.more a{display:grid;grid-template-columns:48px 1fr;gap:14px;align-items:center;padding:8px 0;border-bottom:1px solid var(--line);color:inherit;text-decoration:none}
.more img{width:48px;height:60px;display:block;border-radius:14px}
.more span{font:400 1.25rem/1.15 var(--display)}.more small{display:block;font:400 .78rem/1.4 'Work Sans',system-ui,sans-serif;color:var(--ink-2)}
footer{padding:22px 0 40px;font-size:.82rem;color:var(--ink-2);text-align:center}
@media(prefers-color-scheme:dark){footer{color:#A79B87}footer a{color:#7FB56F}}
@media(min-width:760px){header{padding:28px 0 20px}article{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,6fr);align-items:start}
figure{padding:40px 0 40px 40px;position:sticky;top:0}figure img{width:100%;max-width:380px}.recipe{padding:44px 48px 44px 40px}}`;

function page(d) {
  const url = `${BASE}drink/${d.id}/`, img = BASE + art(d), n = d.serves || 1, desc = description(d);
  const glass = tax('glass', d.glass);
  const ld = {
    '@context': 'https://schema.org', '@type': 'Recipe', name: d.name, image: img, url, description: desc,
    recipeCategory: 'Cocktail', recipeYield: `${n} ${t(LANG, n === 1 ? 'serving_one' : 'serving_many')}`,
    recipeIngredient: d.ingredients.map(l => lineText(l, n)),
    recipeInstructions: [{ '@type': 'HowToStep', text: d.method[LANG] || d.method.en }],
    ...(d.source && d.source.url ? { isBasedOn: d.source.url } : {}),
  };
  const rows = d.ingredients.map(l => `<li><b>${esc(amount(l, n))}</b><span>${esc(ing(l.id))}${l.unit === 'garnish' ? `<small>${esc(t(LANG, 'unit_garnish'))}</small>` : ''}</span></li>`).join('\n');
  const source = !d.source || !d.source.label ? '' : `<p class="source">${esc(t(LANG, 'source_label'))}: ${d.source.url
    ? `<a href="${esc(d.source.url)}" rel="noopener">${esc(d.source.label)}</a>` : esc(d.source.label)}</p>`;
  const similar = similarDrinks(d, db.drinks);
  const more = !similar.length ? '' : `<nav class="more" aria-labelledby="more"><h2 id="more">${esc(t(LANG, 'similar_title'))}</h2>
${similar.map(o => `<a href="../${esc(o.id)}/"><img src="../../${esc(art(o))}" alt="" width="48" height="60" loading="lazy" decoding="async"><span>${esc(o.name)}<small>${esc(meta(o))}</small></span></a>`).join('\n')}</nav>`;
  return `<!DOCTYPE html>
<html lang="sv">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(d.name)}: recept | Sipdeck</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Sipdeck">
<meta property="og:locale" content="sv_SE">
<meta property="og:title" content="${esc(d.name)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${img}">
<meta property="og:image:type" content="image/webp">
<meta property="og:image:width" content="640">
<meta property="og:image:height" content="800">
<meta property="og:image:alt" content="${esc(`${d.name} i ${glass}`)}">
<meta name="twitter:card" content="summary">
<meta name="theme-color" content="#EFE8DB" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#17130E" media="(prefers-color-scheme: dark)">
<link rel="icon" href="../../design/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="../../icons/apple-touch-icon.png" sizes="180x180">
<style>
${CSS}
</style>
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
</head>
<body>
<header><a href="../../" aria-label="Till Sipdeck">${WORDMARK}</a></header>
<main>
<article>
<figure><img src="../../${esc(art(d))}" alt="${esc(`${d.name} i ${glass}`)}" width="640" height="800" fetchpriority="high" decoding="async"></figure>
<div class="recipe">
<h1>${esc(d.name)}</h1>
<p class="meta">${esc(meta(d))}</p>
<h2>${esc(t(LANG, 'ingredients_title'))}</h2>
${n > 1 ? `<p class="serves">${esc(`${n} ${t(LANG, 'serving_many')}`)}</p>\n` : ''}<ul>
${rows}
</ul>
<h2>${esc(t(LANG, 'method_title'))}</h2>
<p class="method">${esc(d.method[LANG] || d.method.en)}</p>
${source}
<a class="open" href="../../#/drink/${esc(d.id)}">Öppna i Sipdeck <span aria-hidden="true">→</span></a>
${more}
</div>
</article>
</main>
<footer>Sipdeck · Swipe. Save. Shake. · Drick ansvarsfullt · <a href="../../info.html">Integritet och villkor</a></footer>
</body>
</html>
`;
}

// sökväg relativt repot -> innehåll; test.js jämför med filerna på disk
function pages() {
  const out = new Map();
  db.drinks.forEach(d => out.set(`drink/${d.id}/index.html`, page(d)));
  out.set('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>${BASE}</loc></url>
${db.drinks.map(d => `<url><loc>${BASE}drink/${d.id}/</loc></url>`).join('\n')}
</urlset>
`);
  return out;
}

if (require.main === module) {
  const dir = path.join(ROOT, 'drink');
  fs.rmSync(dir, { recursive: true, force: true }); // borttagna drinkar ska inte lämna sidor kvar
  for (const [file, html] of pages()) {
    fs.mkdirSync(path.dirname(path.join(ROOT, file)), { recursive: true });
    fs.writeFileSync(path.join(ROOT, file), html);
  }
  console.log(`${db.drinks.length} drinksidor och sitemap.xml skrivna.`);
}

module.exports = { pages, page, description };
