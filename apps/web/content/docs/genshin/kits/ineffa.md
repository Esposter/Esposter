---
title: Ineffa
description: Ineffa's kit as built: her four strikes, charged attack, Cleaning Mode's shield and Birgitta's discharges, Cyclonic Exterminator, which summons Birgitta again, and her Moonsign Benediction, which turns the party's Electro-Charged into Lunar-Charged. Her Lunar-Charged passives and constellations are not built yet.
---

# Ineffa

Ineffa's kit is one module, `createIneffaKit`, avatar 10000116: her four strikes, a charged attack, Cleaning Mode as her skill, Cyclonic Exterminator as her burst, a low, high and collision plunge, and her Moonsign Benediction. Her multipliers are read from proud skill groups 11631, 11632 and 11639: the strikes, charged attack, stamina and plunges from the first, the skill's damage, shield, Birgitta's damage, durations and cooldown from the second, and the burst's damage, cooldown and energy cost from the third. The charged attack costs the 25 stamina the table gives it, the skill cools for 16 seconds, and the burst costs 60 energy and cools for 15 seconds.

## Not yet built

- **Her Lunar-Charged passives and constellations are not built.** Ascension 1 and 4 and Constellations 1, 4 and 6 read Lunar-Charged: a bonus Lunar-Charged attack on Birgitta's discharge while Lunar-Charged holds, Energy on Lunar-Charged, and a bonus attack. Lunar-Charged and the direct Lunar hit are built ([combat](/docs/genshin/combat#lunar-reactions)), so they wait only on her kit's next pass.
- **Constellation 2 is not built.** It places a shield 37 frames after the burst, which the passives' step adds once the shield's amount is set against the framework.
- **Birgitta's Electro particles wait on the particle hook.** gcsim gives her particles on an internal cooldown, which the framework does not produce yet, so her energy is not generated.

## Decisions

- **Her Moonsign Benediction.** It turns the party's Electro-Charged into Lunar-Charged and gives the party's Lunar-Charged 0.7% Base DMG Bonus for each 100 of her ATK, at most 14%, as gcsim's `asc.go` has it.
- **The skill's shield is a field's tick.** gcsim places Cleaning Mode's shield 4 frames in, so the skill places a field that ticks once then, and the shield reads her ATK as it stands at that tick: the table's share of ATK plus its flat HP. It is Electro and lasts the 20 seconds the table gives it, from its placement.
- **Birgitta is summoned on the frame of her cast.** Cleaning Mode summons her 42 frames after its hit, at 68 frames, and Cyclonic Exterminator summons her at its hit, at 111 frames. Each summon sets the one on the field to end, as gcsim restarts her discharges, so Birgitta is never on the field twice.
- **Birgitta's discharges.** Each lands 42 frames after her spawn and every 119 frames after, ten in all, on a circle the framework centres on the targeted enemy with a radius of 4 metres. She stands for 1,200 frames from her spawn.
- **The plunges are borrowed.** gcsim has no plunge file for Ineffa, so her plunges share the kit constants' reach, each hits as its action starts, and they deal the poise 150 for the high, 100 for the low and 25 for the collision that Mizuki's do. The roadmap's manual verification has the question.
- **Her strikes and charged attack give no poise.** gcsim gives Ineffa's normal attacks, charged attack and burst no poise, so each reads 0.

## Key files

| File                                                              | Role                                                                                                                                                         |
| :---------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/ineffaKit.ts` | `createIneffaKit`, Ineffa's four strikes, charged attack, Cleaning Mode and its shield, Birgitta and Cyclonic Exterminator, plunges and Moonsign Benediction |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/main/internal/characters/ineffa), MIT, at main: the four strikes' hitmarks, cancels and reaches, the charged attack, Cleaning Mode and its shield and Birgitta, Cyclonic Exterminator, the Moonsign Benediction, and the Lunar-Charged passives and constellations not yet built.
- [Hosted game data](/docs/genshin/hosted-game-data): the proud skill groups 11631, 11632 and 11639 the multipliers are read from, and the skill-kit record for her cooldowns and energy cost.
