# Dahlia

Dahlia's kit is its record and one behaviour module, `createDahliaKitBehaviour`, avatar 10000115: her four strikes, a charged attack, Immersive Ordinance as her skill with its tap and hold, Radiant Psalter as her burst with its shield, and a low, high and collision plunge. Her multipliers are read from proud skill groups 11531, 11532 and 11539, the burst's shield, Favonian Favor's seconds and its multiplier among them. The charged attack costs 20 stamina, the skill cools for 9 seconds, and the burst takes 60 energy and a 15-second cooldown.

## Not yet built

The framework holds no Benison stacks and no attack-speed buff for the party, so everything that depends on them waits on those hooks.

- **Benison stacks and the shield's regeneration wait on the Benison hook.** Her normal attacks gain her stacks during Favonian Favor, four hits to a stack, and a broken shield is made again from a stack. Radiant Psalter's shield is built here, but it is not made again once it breaks.
- **The Favonian Favor attack speed waits on the attack-speed hook.** The active party member gets an attack-speed bonus from her burst's Favonian Favor, which the framework has no attribute or party buff for. Her charged attack takes none.
- **Her skill's Hydro particles wait on the particle hook.** Immersive Ordinance gives three Hydro particles on an internal cooldown, so its energy goes ungenerated, as the index says of every particle.
- **Her Ascension passives and constellations are not built.** Ascension 1 and Constellation 1 and 2 read the Benison stacks, and Ascension 4 and Constellation 6 read the attack-speed bonus, so they wait on the hooks above. Constellation 4 lengthens Favonian Favor, which the passives' step adds to the burst.

## Decisions

- **The shield is a task's.** gcsim places Radiant Psalter's shield 31 frames in, so the burst sets a task that runs then; the shield reads her Max HP as it runs, as the table's share of Max HP plus a flat HP. It lasts the 12 seconds Favonian Favor holds, from its placement.
- **The hold's threshold is provisional.** gcsim takes Immersive Ordinance's hold as its own variant but gives no threshold for it, so the kit uses the 0.5 seconds the other holds use. The roadmap's manual verification has the question.
- **The plunges are borrowed.** Dahlia has no gcsim plunge file, so her three plunges are priced like the ones in [how a kit is read](../README.md#how-a-kit-is-read), with the 150, 100 and 25 poise Mizuki's plunges are given. The roadmap's manual verification has the question.
- **Normal attacks and the charged attack have no poise.** gcsim gives her normal attacks and charged attack none, so the kit stands both at 0.

## Key files

| File                                                              | Role                                                                                                                         |
| :---------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/dahliaKit.ts` | `createDahliaKitBehaviour`, Dahlia's four strikes, charged attack, Immersive Ordinance, Radiant Psalter's shield and plunges |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/dahlia), MIT, at v2.47.2: hitmarks, cancels and reaches for the strikes and the charged attack, the skill's tap and hold, the burst and its shield, and the Benison and attack-speed states the hooks wait on.
- [Hosted game data](../../hosted-game-data/design.md): the proud skill groups 11531, 11532 and 11539 and the skill-kit record.
