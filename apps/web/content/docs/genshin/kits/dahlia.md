---
title: Dahlia
description: Dahlia's kit as built: her four strikes, charged attack, Immersive Ordinance's tap and hold, and Radiant Psalter's shield. Her Benison stacks, Favonian Favor's attack speed and her passives wait on the Benison and attack-speed hooks.
---

# Dahlia

Dahlia's kit is one module, `createDahliaKit`, avatar 10000115: her four strikes, a charged attack, Immersive Ordinance as her skill with its tap and hold, Radiant Psalter as her burst with its shield, and a low, high and collision plunge. Her multipliers are read from proud skill groups 11531, 11532 and 11539: the strikes, charged attack, stamina and plunges from the first, the skill's multiplier and cooldown from the second, and the burst's multiplier, shield, Favonian Favor's seconds, energy cost and cooldown from the third. The charged attack costs the 20 stamina the table gives it, the skill cools for 9 seconds, and the burst costs 60 energy and cools for 15 seconds.

## Not yet built

The framework holds no Benison stacks and no attack-speed buff for the party, so everything that depends on them waits on those hooks.

- **Benison stacks and the shield's regeneration wait on the Benison hook.** Her normal attacks gain her stacks during Favonian Favor, four hits to a stack, and a broken shield is made again from a stack. Radiant Psalter's shield is built here, but it is not made again once it breaks.
- **The Favonian Favor attack speed waits on the attack-speed hook.** The active party member gets an attack-speed bonus from her burst's Favonian Favor, which the framework has no attribute or party buff for. Her charged attack takes none.
- **Her skill's Hydro particles wait on the particle hook.** Immersive Ordinance gives three Hydro particles on an internal cooldown, which the framework does not produce yet, so its energy is not generated.
- **Her Ascension passives and constellations are not built.** Ascension 1 and Constellation 1 and 2 read the Benison stacks, and Ascension 4 and Constellation 6 read the attack-speed bonus, so they wait on the hooks above. Constellation 4 lengthens Favonian Favor, which the passives' step adds to the burst.

## Decisions

- **The shield is a field's tick.** gcsim places Radiant Psalter's shield 31 frames in, so the burst places a field that ticks once then, and the shield reads her Max HP as it stands at that tick: the table's share of Max HP plus its flat HP. It lasts the 12 seconds Favonian Favor holds, from its placement.
- **The hold's threshold is provisional.** gcsim takes Immersive Ordinance's hold as its own variant but gives no threshold for it, so the kit uses the 0.5 seconds the other holds use. The roadmap's manual verification has the question.
- **The plunges are borrowed.** gcsim has no plunge file for Dahlia, so her plunges share the kit constants' reach, each hits as its action starts, and they deal the poise 150 for the high, 100 for the low and 25 for the collision that Mizuki's do. The roadmap's manual verification has the question.
- **Her strikes and charged attack give no poise.** gcsim gives Dahlia's normal attacks and charged attack no poise, so each reads 0.

## Key files

| File                                                              | Role                                                                                                                |
| :---------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------ |
| `packages/genshin-world/src/services/kit/characters/dahliaKit.ts` | `createDahliaKit`, Dahlia's four strikes, charged attack, Immersive Ordinance, Radiant Psalter's shield and plunges |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/main/internal/characters/dahlia), MIT, at main: the four strikes' hitmarks, cancels and reaches, the charged attack, the skill's tap and hold, the burst and its shield, and the Benison and attack-speed states the hooks wait on.
- [Hosted game data](/docs/genshin/hosted-game-data): the proud skill groups 11531, 11532 and 11539 the multipliers are read from, and the skill-kit record for her cooldowns and energy cost.
