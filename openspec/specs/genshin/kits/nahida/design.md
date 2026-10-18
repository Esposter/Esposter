# Nahida

Nahida's kit is its record and one behaviour module, `createNahidaKitBehaviour`, on avatar 10000073: four strikes, a charged attack, a collision and two plunges, and All Schemes to Know with its press and its full hold, which strike the enemies within their reach as Dendro. Her multipliers are read from proud skill groups 7331, 7332 and 7339; the charged attack's stamina, the skill's cooldowns, and the burst's cooldown and energy cost are read from the same groups. Her hold is gcsim's full hold of 300 frames, and a shorter hold has no level of its own, so its release plays the press. Illusory Heart's field is not built, as it deals no damage of its own and its buffs and Tri-Karma's cooldown wait on the kit's party effects. Tri-Karma Purification, which strikes on each reaction of an enemy marked by her skill, is not built, and neither are her Ascension and Constellation passives. Bennett's timings and poise are borrowed for the plunges.

## Decisions

- **Nahida's plunges take Bennett's timings and poise.** No plunge file exists in her gcsim folder, so the collision, low and high plunge in `nahidaKit.ts` use Bennett's timings (frames 36 and 38 for the low and high hits) and poise of 100 and 150, under her own multipliers. A different animation of hers would move them.

## Key files

| File                                                              | Role                                                                                                                              |
| :---------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/nahidaKit.ts` | `createNahidaKitBehaviour`, Nahida's kit with her strikes, charged attack, plunges, and All Schemes to Know's press and full hold |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/nahida), MIT: Nahida's strikes' hitmarks, cancel frames and boxes, the charged attack's box and frames, and All Schemes to Know's press and hold frames, reaches and cooldowns.
- [gcsim](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/plunge.go), MIT: the plunges' timings and poise, borrowed as Nahida's own folder has none.
