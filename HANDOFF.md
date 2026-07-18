# Handoff: Sipdeck

Read this first, then PRODUCT.md (what to build + acceptance criteria), then BACKLOG.md
(what's next). Written for AI agent sessions picking this up cold.

## Current state in one paragraph

**BACKLOG items 1–7 done** (2026-07-18). Filters now combine the editorial `bar` toggle,
single-select base spirit and visible match count, reset and reshuffle the deck on change,
persist under `settings.filters`, and have a friendly zero-match state. Pantry now lists
all 26 used ingredients in four editorial groups, persists selections, and feeds a
combinable essential-subset "what can I make" deck filter. BACKLOG 9 is partially done:
Margarita, Mojito and Negroni have 640×800 WebP art at 27–45 kB, while missing images keep
the inline SVG fallback without changing card layout. `test.js`: 528 checks green. Items
1–5 retain their earlier phone-browser verification; this session had no controllable
browser, so filters, pantry and image loading still need the phone-viewport interaction
pass. The real-phone 60 fps feel check also remains outstanding. Next: BACKLOG item 8.

## Implementation notes for the next session (things the code assumes)

- `app.js` layout: pure functions top (exported), then one browser IIFE. Module vars
  `db` (fetched drinks.json), `deckQueue` (deck order, ids), `flippedId` (deck flip),
  `favOpenId`/`favFlipped` (favorites overlay) — all transient, never in the state blob.
- Card faces use fixed paper-ink hex (`#211B12`/`#6E6455`), not `--sd-ink` — cards never
  theme-invert (design rule). Gesture tints are opacity-only overlays (composited).
- Flip must animate by toggling `.flipped` on the LIVE element; a re-render rebuilds the
  card with the class pre-applied and snaps instead of animating.
- `formatAmount` returns non-convertible unit labels as raw keys (`dash`); the view layer
  translates via `t('unit_' + key)`; unit `top` renders as just "toppa upp"/"top up".
- Card fronts try `img/<drink-id>.webp` for the top four live cards and retain the favicon
  glass monoline (`GLASS_PH`) until load or on error. Item 9 still owes per-glass
  silhouettes. `convert()` uses 30 ml/oz (bar standard; PRODUCT.md doesn't pin it).
- The `#view` click delegate is attached ONCE at startup (the element is never replaced);
  `#deck`/`#favDeck` listeners re-attach per render (those nodes are recreated).

## Name & brand

**Name: Sipdeck** — locked by the user 2026-07-18 (chosen after briefly locking Drinkr
the same day; Svepa was the agent's recommendation).
Tagline: *"Swipe. Save. Shake."* Tone: stylish, dry, slightly playful.

**Visual identity is finalized** (2026-07-18, same Claude design session per
`DESIGN-BRIEF.md`). Concept: "the garnished deck" — monoline wordmark/icon, one fixed
accent (vermouth green) as the only color the brand itself uses. Real assets live in
`design/`: `tokens.css`, `wordmark.svg`, `icon.svg` + `icon-48.svg` + `favicon.svg`,
plus `identity-full.html` (full archived rationale) and `README.md` (usage map). Summary
in PRODUCT.md's "Visual identity" section. One implementation deviation from the raw
design output, documented in `tokens.css`'s header comment: dark mode is wired to
`prefers-color-scheme` automatically instead of a manual `[data-theme]` attribute,
because v1 has no theme toggle (YAGNI) — the color values themselves are unchanged.
**Do not check domain availability** — the domain/app-store/trademark check is the
user's own to-do before going public.

## Decisions locked 2026-07-18 (grilled in planning — don't relitigate without new info)

1. **Vanilla JS/CSS/HTML, no build, no deps.** Swipe physics is imperative in any stack;
   the rest is coarse re-renders. Switch point would be deep collaborative state — not on
   any roadmap.
2. **Accounts = v1.1, not v1** (pushback accepted: v1 already fat with pantry + i18n +
   asset pipeline; localStorage-first makes sync purely additive). v1's only obligation:
   state stays one sync-shaped blob under one key — already specified in PRODUCT.md.
3. **Accounts backend = recept pattern, minimal cut**: Firebase Auth identity-only +
   Cloudflare Worker + D1, whole-state JSON blob, debounced PUT, last-write-wins. Only
   `GET/PUT /state` + `DELETE /account`. No feed/groups/PIN — deliberate subset.
4. **Hosting = Cloudflare Pages, direct upload** (`npx wrangler pages deploy .`), like
   Årshjul. Custom domain deferred until the name is final.

Earlier locked decisions (data model, units/rounding, filters, pantry, i18n, images) are
in PRODUCT.md "Locked decisions".

## Reuse map — copy, don't reinvent (sibling projects under C:\dev, separate repos)

- `recept/PROJECT.md` — the whole architecture pattern this project follows:
  - State = one localStorage object, whole-blob debounced PUT (800 ms), server-wins-on-
    load, last-write-wins (its "Filer → app.js" section).
  - Worker: Firebase JWT verified RS256 against Google JWKS **without SDK**, aud/iss
    check, key caching (its "worker/" section). Lift this code nearly verbatim in v1.1.
  - `test.js` pattern: plain node asserts over exported pure functions, no framework.
  - PWA manifest with **relative** paths (site lives under a subpath — same gotcha here
    if ever hosted under one).
  - Canonical-unit + linear-scaling + display-formatting layering (g/ml there, ml here).
- `recept/PROJECT.md` "Konventioner": Swedish text = decimal comma, space thousands
  separator, never an em-dash. Applies to all sv strings here.
- `Årshjul/HANDOFF.md` — Cloudflare Pages/wrangler deploy motions; note its gotcha about
  piping secrets with PowerShell (CRLF) if Worker secrets ever get set from Windows.
- `sipdeck/design/` — the finalized visual identity (this session, 2026-07-18): tokens,
  wordmark, icon variants. Use these, don't design new ones. Map of files → use is in
  `design/README.md`.

## Conventions

- All doc files in English (project aims public); app UI is EN + SV from day 1.
- app.js: pure functions at top, exported for test.js; render functions per view; the
  card stack is the only place allowed to touch the DOM imperatively during animation.
- Amounts canonical in ml; ingredient ids kebab-case (`lime-juice`); `essential` explicit
  on every ingredient line.
- Commit messages: `sipdeck: <what>` (repo convention).
- Run `node sipdeck/test.js` after touching app.js pure functions or drinks.json.

## Image pipeline (operational spec)

1. Style prompt (keep verbatim for every drink, only swap the bracketed parts):
   > "Hand-drawn ink and watercolor sketch of a [DRINK NAME] cocktail in a [GLASS] glass,
   > single subject centered on a plain warm-white (#FBF7EF) background, loose confident
   > linework, limited palette with one or two accent colors true to the drink, generous
   > white space around the subject, no text, no watermark, no border, portrait
   > composition."
   Refine once on the first 3 drinks, then freeze the prompt here.

   **Ready-to-paste ChatGPT session opener** (first 3 test drinks — margarita/coupe,
   mojito/highball, negroni/rocks — chosen for distinct glass shapes and colors):

   > I need illustrations for a cocktail app, all in one exactly consistent style.
   > Portrait orientation (1024×1536). Style for every image: hand-drawn ink and
   > watercolor sketch, single subject centered on a plain warm-white (#FBF7EF)
   > background, loose confident linework, limited palette with one or two accent
   > colors true to the drink, generous white space around the subject, no text, no
   > watermark, no border.
   >
   > First image: a Margarita cocktail in a coupe glass with a salt rim and a lime
   > wheel.

   Then per follow-up, same chat: "Same exact style: a Mojito in a tall highball glass
   with mint sprig and lime" / "Same exact style: a Negroni in a rocks glass with a
   large ice cube and orange peel." Judge the 3 together for consistency before
   batch-generating the rest; adjust this section if the prompt needed changes.

   **First-three verdict (2026-07-18): pass, freeze the prompt.** Margarita, Mojito and
   Negroni share the same warm-white paper, confident fine ink, watercolor texture,
   centered portrait composition, generous whitespace and comparable line weight. The
   Mojito is naturally more detailed, but its rendering still clearly belongs to the
   same set. No prompt adjustment is needed before generating the remaining drinks.
2. Generated externally (ChatGPT image tools) by the user; agent receives PNGs.
3. Convert: to WebP ≤ 80 kB at ~640×800 (`cwebp -q 80` or equivalent available tool);
   filename **must** be `img/<drink-id>.webp`.
4. App lazy-loads top 3–4 cards only; missing file ⇒ inline-SVG glass silhouette per
   `glass` field. A missing image must never break layout or animation.

## Immediate next steps (in order)

1. Phone-viewport browser pass for filters, pantry, image loading and missing-image
   fallback; then do the outstanding real-phone 60 fps feel check.
2. BACKLOG 8: i18n polish (language toggle in settings — the string table and browser
   default already exist, this is mostly the settings controls).
3. Finish BACKLOG 9: generate the other seed images with the frozen prompt and replace
   the generic fallback with SVG silhouettes keyed by `glass`.
4. BACKLOG 10: grow and review the drink seed.

## How to run / deploy

```
python -m http.server            # from sipdeck/ — no build step
node test.js                     # pure-function + data validation tests
npx wrangler pages deploy . --project-name sipdeck --branch main   # Cloudflare Pages
```

Live (since 2026-07-18): **https://sipdeck.pages.dev** (Cloudflare Pages, deploy =
wrangler command above) and **https://orgutveckling.se/sipdeck/** (GitHub Pages, deploy
= just `git push`; serves repo root off main — note the subpath, which is why all asset
paths must stay relative). Both verified rendering with zero console errors. Delete
`.playwright-mcp/` before wrangler deploys — wrangler doesn't read .gitignore.

## Git

Own repo at `C:\dev\sipdeck` → github.com/Elwyndaz/sipdeck (like recept; each project
under C:\dev is its own repo — ignore the stale parent repo at C:\dev, never push it).
Commit messages: `sipdeck: <what>`.

## Verification state

`node test.js`: 528 green; `node --check app.js`: green; `git diff --check`: green;
`app.js`: 29.5 kB. Local HTTP smoke: index/app/image return 200 with `image/webp` for art;
a missing image returns 404 and is handled by the live `<img>` error fallback. Converted
assets were visually inspected at 640×800. Items 1–5 retain their earlier Playwright
phone-viewport smoke (deck gestures/flip/recipe/favorites/settings), zero console errors.
No controllable browser was available in the 2026-07-18 filters/pantry/image session, so
those new flows are not yet browser-verified. Real-phone feel check NOT done. This file's
"Current state" paragraph must be updated at the end of every working session
(recept/Årshjul convention).
