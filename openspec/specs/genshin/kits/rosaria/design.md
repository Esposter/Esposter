# Rosaria

Rosaria's kit is its record and one behaviour module, `createRosariaKitBehaviour`, on avatar 10000045: a seven-hit string over five normal attacks, a charged attack, then a collision and two plunges, Ravaging Confession with its two hits and cooldown, and Rites of Termination with its slash, lance and field of ticks. Her multipliers are read from proud skill groups 4531, 4532 and 4539; the charged attack's stamina, the skill's cooldown, and the burst's seconds, cooldown and energy cost are read from the same groups. The field ticks every two seconds from the cast's body, each tick a circle that sits three metres ahead of the body, and Constellation 2 adds four seconds to it. Ravaging Confession's reach prices from the body, as Rosaria's teleport behind the target is not built, Ascension 4's Crit Rate share is built on the cast. From Ascension 1, Regina Probationum gives her 12% CRIT Rate for 5 seconds as Ravaging Confession's first hit strikes an enemy, taken as from behind, as gcsim assumes it lands so; her other constellations are not built. The strikes' and the charged attack's poise takes the wiki's values, while the plunges' frames, and the charged attack's stamina's meaning, read by its place in the table, are provisional.

## Key files

| File                                                               | Role                                                                                                                                                 |
| :----------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/rosariaKit.ts` | `createRosariaKitBehaviour`, Rosaria's kit with her seven-hit string, Ravaging Confession and Rites of Termination's slash, lance and field of ticks |

## Sources

- [Spear of the Church](https://genshin-impact.fandom.com/wiki/Spear_of_the_Church), [Ravaging Confession](https://genshin-impact.fandom.com/wiki/Ravaging_Confession) and [Rites of Termination](https://genshin-impact.fandom.com/wiki/Rites_of_Termination), Genshin Impact Wiki: the poise of her strikes, charged attack, collision, skill, burst and field's ticks.
