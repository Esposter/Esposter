---
title: Xilonen
description: Xilonen's kit as built: her three strikes, charged attack, collision and two plunges, and Yohual's Scratch's hit, and what is left of her Nightsoul Blessing, her Samplers and Ocelotlicue Point.
---

# Xilonen

Xilonen's kit is its record and one behaviour module, `createXilonenKitBehaviour`, on avatar 10000103: three strikes with the second of two hits, a charged attack, a collision and two plunges, and Yohual's Scratch's hit. Her multipliers are read from proud skill groups 10331, 10332 and 10339, and match gcsim's values to four decimal places. Her plunges' and Yohual's Scratch's damage is her share of Defense, added as flat damage to each hit's base damage as it is priced, as Chiori's Defense shares are.

## Decisions

- **Her strikes and charged attack are the kit outside the Nightsoul Blessing.** The first strike is a circle of radius 2.1 one metre ahead, the second a fan of 150 degrees and the third one of 160, each priced as its offset plus its radius. The charged attack is a box 1.8 metres behind her, 2 wide and 4.5 long, priced to its far corner, with Poise 120.
- **Yohual's Scratch hits at 6 frames of its 20-frame animation.** It is a circle of radius 0.8 one metre ahead, priced as its offset plus its radius, and it deals her Defense share, its Geo gauge at 1.
- **The skill's cooldown is the table's seven seconds, run from the press.** In gcsim it runs from the Blessing's end, which is not built, so the cooldown starts the moment of the press here.
- **Ocelotlicue Point is not built, so the burst has no hit.** It keeps gcsim's 101-frame animation, the table's 60 energy and 15-second cooldown. Its damage is read only with fewer than two Samplers in the party, and its heal with two or more, as gcsim picks them. The kit step cannot count the team's elements yet, so neither branch is chosen.
- **Her plunges are gcsim's, with their Defense shares.** The collision is at 41 frames, a circle of radius 1 one metre ahead, the low plunge at 47 frames of 75 with radius 3 and Poise 100, and the high at 50 frames with radius 5 and Poise 150.

## Not built

- **The Nightsoul Blessing is not built.** Her press would start it, replacing her strikes with the Blade Roller's four, forbidding her charged attack and low plunge, and making her Samplers, once the framework gaps the index lists are filled.
- **The Blade Roller's four strikes are not built.** They stand in for her strikes while the Blessing lasts, so they wait on the Blessing above.
- **The Samplers and their Sampler RES shred are not built.** A Blessing's Samplers shred an enemy's RES to the elements the party's other members carry, by the table's 0.09 each, with Geo standing in for any element outside Pyro, Hydro, Cryo and Electro. The Samplers wait on the Blessing, and their count on a kit step that reads the deployed team's elements, which the step context does not yet carry.
- **Ocelotlicue Point's heal is not built.** With two or more Samplers in the party, the burst heals the active member on a schedule, through eight ticks at each 1.5 seconds, instead of its damage. The heal waits on the kit step reading the team's elements, and on a timed heal to the active member.
- **Her skill high plunge is not built.** A plunge that follows her Yohual's Scratch lands at 39 frames, a skill-only variant that waits on a plunge gate that reads the last action, as the [Chiori](/docs/genshin/kits/chiori) page's low plunge does.
- **Her Ascension bonuses and constellations are not built.** The [constellations](/docs/proposals/genshin/constellations) page holds the second and the [character kits proposal](/docs/proposals/genshin/character-kits) the first.

## Key files

| File                                                               | Role                                                                                                      |
| :----------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/xilonenKit.ts` | `createXilonenKitBehaviour`, Xilonen's kit with her strikes, charged attack, plunges and Yohual's Scratch |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/xilonen), MIT: the kit's hitmarks, animations, reach, the charged attack's box and the plunges' radii and poise, and the proud group indices behind each multiplier.
- [Hosted game data](/docs/genshin/hosted-game-data): the avatar's talent groups 10331, 10332 and 10339 and her skill depot, from the talent and skill kit tables.
