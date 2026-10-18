# Sucrose

Sucrose's kit is its record and one behaviour module, `createSucroseKitBehaviour`, on avatar 10000043: four strikes, a charged attack, a collision and two plunges, Astable Anemohypostasis Creation-6308 with its Swirl, and Forbidden Creation-Isomer 75 / Type II with its Anemo field, which absorbs whichever of Pyro, Hydro, Electro and Cryo an enemy within reach holds first, in gcsim's priority, and strikes it on each tick. Her multipliers are read from proud skill groups 4331, 4332 and 4339; the charged attack's stamina, the skill's cooldown, and the burst's seconds, cooldown and energy cost are read from the same groups. Her Swirl's Elemental Mastery share at Ascension 1, the team's share of her Elemental Mastery on each skill and burst hit at Ascension 4, and Constellations 1, 2, 4 and 6 are built. Constellation 4 cuts Astable's cooldown on each seventh normal or charged attack of hers. The skill's pull is not built, and her Hexerei team bonus is not built.

## Decisions

- **Sucrose's field runs its absorb check on a schedule of its own, and its tick reads the enemies it is given.** gcsim checks for the absorbed element every 18 frames from 136 until one is taken, while the Anemo tick lands at 137 frames and then every 113. Each is its own field, and the absorb check reads the enemies through the field's tick, which is given them on the world's context (`KitContext.enemyMap`). The absorbed element strikes on each Anemo tick after it is taken, and the aura stays on the enemy, as gcsim leaves it.
- **Constellation 1's extra charge is a skill charge.** Astable Anemohypostasis Creation's second use before its cooldown is a charge count, so Constellation 1 adds one through `getSkillChargeBonus`, as Ganyu's Constellation 2 does.
- **Constellation 4's count is a status that does not run out.** Alchemania counts each normal or charged attack at the first hit's hitmark, which `NormalAttackLanded` and `ChargedAttackLanded` name, and each seventh cuts Astable's cooldown through `changeKitSkillCooldown` by a random 1 to 7 seconds drawn from the world's seeded source. Two places differ from gcsim: gcsim counts only an attack that strikes an enemy, where the kit counts one whether or not it struck anything, and gcsim draws whole seconds from 1 to 6, where the wiki's range is kept as a fraction of a second.

## Key files

| File                                                               | Role                                                                                                                                                                          |
| :----------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/sucroseKit.ts` | `createSucroseKitBehaviour`, Sucrose's kit with Astable Anemohypostasis Creation-6308 and its Swirl, and Forbidden Creation's Anemo field, its absorb check and absorbed hits |

## Sources

- [gcsim v2.47.2](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/sucrose), MIT: Sucrose's strikes' hitmarks, cancels and circles, the charged attack's box, Astable Anemohypostasis Creation-6308's circle, its frames and cooldown, Forbidden Creation's frames, ticks, absorb check and Constellations 2 and 6, Constellation 4's count and cut in `cons.go`, and her Ascension 1 and 4 passives.
