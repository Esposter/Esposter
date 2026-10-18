# Sucrose

Sucrose's kit is its record and one behaviour module, `createSucroseKitBehaviour`, on avatar 10000043: four strikes, a charged attack, a collision and two plunges, Astable Anemohypostasis Creation-6308 with its Swirl, and Forbidden Creation-Isomer 75 / Type II with its Anemo field, which absorbs whichever of Pyro, Hydro, Electro and Cryo an enemy within reach holds first, in gcsim's priority, and strikes it on each tick. Her multipliers are read from proud skill groups 4331, 4332 and 4339; the charged attack's stamina, the skill's cooldown, and the burst's seconds, cooldown and energy cost are read from the same groups. Her Swirl's Elemental Mastery share at Ascension 1, the team's share of her Elemental Mastery on each skill and burst hit at Ascension 4, and Constellations 2 and 6 are built. The skill's pull is not built. Constellation 4 is not, as the kit has no cooldown to shorten, and her Hexerei team bonus is not built.

## Decisions

- **Sucrose's field runs its absorb check on a schedule of its own, and its tick reads the enemies it is given.** gcsim checks for the absorbed element every 18 frames from 136 until one is taken, while the Anemo tick lands at 137 frames and then every 113. Each is its own field, and the absorb check reads the enemies through the field's tick, which is given them on the world's context (`KitContext.enemyMap`). The absorbed element strikes on each Anemo tick after it is taken, and the aura stays on the enemy, as gcsim leaves it.

## Key files

| File                                                               | Role                                                                                                                                                                          |
| :----------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/sucroseKit.ts` | `createSucroseKitBehaviour`, Sucrose's kit with Astable Anemohypostasis Creation-6308 and its Swirl, and Forbidden Creation's Anemo field, its absorb check and absorbed hits |

## Sources

- [gcsim v2.47.2](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/sucrose), MIT: Sucrose's strikes' hitmarks, cancels and circles, the charged attack's box, Astable Anemohypostasis Creation-6308's circle, its frames and cooldown, Forbidden Creation's frames, ticks, absorb check and Constellations 2 and 6, and her Ascension 1 and 4 passives.
