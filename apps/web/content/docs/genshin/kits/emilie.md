---
title: Emilie
description: Emilie's kit as built, with her four strikes, charged attack, collision and plunges, the Lumidouce Case's summon hit with Spiritbreath Thorn, Constellation 2 and Ascension 4, and what is left waiting on the Cleardew hook.
---

# Emilie

Emilie's kit is its record and one behaviour module, `createEmilieKitBehaviour`, on avatar 10000099: her four strikes, a charged attack, a plunge collision and two plunges, the Lumidouce Case's summon hit with Spiritbreath Thorn, and her Constellation 2 and Ascension 4. Her multipliers are read from proud skill groups 9931, 9932 and 9939, matching gcsim's to four decimal places. The skill cools for 14 seconds, the burst for 13.5 with an energy cost of 50, and the charged attack costs 25 stamina.

## Decisions

- **Her strikes are priced as gcsim has them, round the primary target.** Her first, third and fourth are circles centred 0.4 metres ahead, of radii 2, 2.5 and 3, and her second a box of 1.6 by 3 metres on the target. Each is priced as the circle round the body that holds its reach from the target, as the strike's targeting area does. Her strikes and charged attack are physical, so they deal no element and no gauge.
- **Spiritbreath Thorn lands with every press.** Its cooldown of 10 seconds has always run out before the skill's of 14 comes round again, so the skill lands it each time. Its hit at 62 frames falls past the skill's 37-frame animation, and lands on the action's clock as the framework has late hitmarks.
- **Constellation 2 cuts the Dendro RES of each enemy the skill's hits strike by 30% for 10 seconds.** gcsim applies it to every enemy hit whose damage is not zero, which the kit reads as an enemy status on each hit, given Emilie's constellations.
- **Ascension 4 adds a DMG Bonus of 0.15 per 1000 of her total ATK, to a cap of 36%, to each strike that lands on a Burning enemy.** It is read through the kit's strike damage bonus, from her attack as it stands.
- **The plunges' reach is gcsim's**, a circle of radius 1 for the collision and of radii 3 and 5 for the low and high plunge, each centred a metre ahead of the body, with the collision at 41 frames and the plunges' hitmarks at 47 and 49. Their poise is 100 and 150, and the collision deals none.

## Not built

- **The Lumidouce Case, its ticks and its levels wait on the Cleardew hook.** The case strikes every 1.5 seconds at level 1, and rises to levels 2 and 3 as Cleardew is generated: a Burning enemy within 20 metres of the case generates one every half second, and two of them raise its level. Until a kit can read the Burning enemies in an area and keep the case's scents, the case's ticks and levels are not built, so the skill deals its summon hit and Thorn only.
- **The burst waits on the Cleardew hook.** The burst is the Lumidouce Case at level 3, which strikes a random enemy in its area every 0.3 seconds; a field's tick can draw that enemy, since it is given the world's context and its random source. Until the hook lands the burst's action is a placeholder: it spends the energy and starts the cooldown, and deals nothing.
- **Cleardew Cologne (Ascension 1) and Constellation 1 wait on the Cleardew hook.** Constellation 1 generates Cleardew when a Burning enemy takes Dendro, and Cleardew Cologne spends two of it on a hit from the case.
- **Constellation 6 waits on the Cleardew hook and on a flat damage infusion.** It adds 3 times Emilie's total ATK as flat damage to her normal and charged attacks for 5 seconds, changes them to Dendro and generates Cleardew, which an infusion that adds flat damage does not yet express.
- **The skill's and the case's particles are not built.** A hit's particles are not a kit step's yet, as the Traveler's and Zhongli's are not.

Talent levels and constellations are read at the level the kit is built at: raising them is the [talents](/docs/proposals/genshin/talents) and [constellations](/docs/proposals/genshin/constellations) pages'.

## Key files

| File                                                              | Role                                                                                                                                                   |
| :---------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/emilieKit.ts` | `createEmilieKitBehaviour`, Emilie's kit with her strikes, plunges, the Lumidouce Case's summon hit and Thorn, and her Constellation 2 and Ascension 4 |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/emilie), MIT: the strikes' hitmarks, animations and reaches, the charged attack's box, the plunges' circles, collision and hitmarks, the skill's summon hit and Thorn, the burst's animation, Constellation 2 and Ascension 4, and the proud skill groups' indices, read from gcsim's Emilie data file.
