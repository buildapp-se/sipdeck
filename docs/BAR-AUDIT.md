# Strict normal-bar audit (BACKLOG 13)

Date: 2026-07-19. Scope: all 57 drinks then marked `bar: true`. Rule (PRODUCT.md D1):
`bar: true` only when **every essential ingredient** is likely stocked or routinely
prepared by an ordinary, non-specialist bar. One doubtful required ingredient makes the
drink `bar: false`. Recipes, ingredients and the 92-drink seed are unchanged; only `bar`
flags moved. Result: **37 stay true, 20 flipped to false**.

## Baseline: what an ordinary bar reliably has

Grounded in standard well/speed-rail stock guides (TouchBistro "Well Drinks List",
Lightspeed "Well Drinks", BinWise bar-stock guides, A Bar Above "What's in my well?")
plus editorial judgment for the Swedish krog context.

- **Spirits (well)**: vodka, gin, white rum, dark rum, blanco tequila, bourbon, blended
  scotch, Irish whiskey, Tennessee whiskey (Jack Daniel's), cognac/brandy.
- **Liqueurs**: triple sec, coffee liqueur (Kahlúa), amaretto, Irish cream, peach
  liqueur/schnapps, blue curaçao, Campari, Aperol.
- **Vermouth**: dry and sweet (red). Not blanc.
- **Bitters**: Angostura only.
- **Wine/bubbles**: prosecco/cava-class sparkling. Not champagne specifically.
- **Mixers**: cola, tonic, soda water, lemon-lime soda, ginger beer (mule-era staple),
  sour mix/sugar syrup, grenadine.
- **Juices**: orange, cranberry, pineapple, tomato, fresh lemon/lime.
- **Fresh/pantry**: lemons, limes, mint (mojito-era staple), sugar, salt, coffee/espresso,
  cream, Worcestershire, Tabasco.
- **NOT reliable**: cachaça, pisco, Old Tom gin, rye whiskey, overproof rum, vanilla
  vodka, Drambuie, maraschino liqueur, orange curaçao, blanc vermouth, orange bitters,
  champagne, raspberry/agave syrup, lime cordial, passion-fruit purée, vanilla sugar,
  coconut cream, sugar-cane juice, grapefruit soda, grapefruit juice, egg white
  (prepped), olive brine/olives.

## Decisions — stays `bar: true` (37)

| Drink | Essentials all in baseline |
|---|---|
| margarita | tequila, triple sec, lime |
| daiquiri | white rum, lime, sugar syrup |
| mojito | white rum, lime, syrup, mint, soda — mint judged reliable (menu staple) |
| negroni | gin, Campari, sweet vermouth |
| old-fashioned | bourbon, syrup, Angostura |
| whiskey-sour | bourbon, lemon, syrup |
| dry-martini | gin, dry vermouth |
| espresso-martini | vodka, coffee liqueur, espresso (bars have espresso machines) |
| cosmopolitan | vodka, triple sec, cranberry, lime |
| bloody-mary | vodka, tomato juice, lemon, Worcestershire |
| french-75 → see flipped | — |
| gin-fizz | gin, lemon, syrup, soda |
| irish-coffee | Irish whiskey, coffee, cream, sugar |
| moscow-mule | vodka, ginger beer, lime |
| white-russian | vodka, coffee liqueur, cream |
| amaretto-sour | amaretto, lemon |
| boulevardier | bourbon, Campari, sweet vermouth |
| rob-roy | scotch, sweet vermouth, Angostura |
| mint-julep | bourbon, syrup, mint |
| godfather | scotch, amaretto |
| lynchburg-lemonade | Tennessee whiskey, triple sec, lemon, syrup, lemon-lime soda |
| southside | gin, lemon, syrup, mint |
| white-lady | gin, triple sec, lemon |
| gin-and-tonic | gin, tonic |
| cuba-libre | white rum, cola, lime |
| dark-n-stormy | dark rum, ginger beer, lime |
| tequila-sunrise | tequila, orange juice, grenadine |
| black-russian | vodka, coffee liqueur |
| long-island-iced-tea | well spirits, triple sec, lemon, syrup, cola |
| sex-on-the-beach | vodka, peach liqueur, orange juice, cranberry |
| lemon-drop-martini | vodka, triple sec, lemon, syrup |
| caipiroska | vodka, lime, sugar |
| blue-lagoon | vodka, blue curaçao, lemon-lime soda |
| aperol-spritz | prosecco, Aperol, soda |
| mimosa | prosecco, orange juice |
| americano | Campari, sweet vermouth, soda |
| sidecar | cognac, triple sec, lemon |
| french-connection | cognac, amaretto |

(The table lists 38 rows because french-75 is cross-referenced; 37 remain true.)

## Decisions — flipped to `bar: false` (20)

| Drink | Blocking essential(s) |
|---|---|
| gimlet | lime-cordial (Rose's not reliably stocked) |
| caipirinha | cachaca |
| clover-club | raspberry-syrup |
| french-75 | champagne (bars stock prosecco/cava, recipe requires champagne) |
| paloma | grapefruit-soda |
| porn-star-martini | vanilla-vodka, passion-fruit-puree, vanilla-sugar, champagne |
| tom-collins | old-tom-gin (recipe's essential; bars carry dry gin) |
| pisco-sour | pisco, egg-white |
| manhattan | rye-whiskey (recipe's essential; bourbon substitution ≠ this recipe) |
| rusty-nail | drambuie |
| martinez | old-tom-gin, maraschino-liqueur, orange-bitters |
| dirty-martini | olive-brine (olives not reliable at ordinary bars) |
| pina-colada | coconut-cream |
| planters-punch | sugar-cane-juice |
| rum-punch | overproof-rum |
| hemingway-daiquiri | maraschino-liqueur, grapefruit-juice |
| el-presidente | blanc-vermouth, orange-curacao |
| tommys-margarita | agave-syrup |
| sea-breeze | grapefruit-juice (borderline; juice line at ordinary bars is OJ/cranberry/pineapple/tomato) |
| champagne-cocktail | champagne |

## Regression coverage

`test.js` asserts the exact 37-id allowlist; any future flag drift fails the suite.

Sources: [TouchBistro well drinks list](https://www.touchbistro.com/blog/well-drinks-list/),
[Lightspeed well drinks](https://www.lightspeedhq.com/blog/well-drinks/),
[BinWise how to stock a bar](https://home.binwise.com/blog/how-to-stock-a-bar),
[A Bar Above — what's in my well](https://abarabove.com/whats-in-your-well/).
