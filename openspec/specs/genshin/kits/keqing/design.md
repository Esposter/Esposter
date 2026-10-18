# Keqing

Keqing's kit is its record and one behaviour module, `createKeqingKitBehaviour`, on avatar 10000042: five strikes, a charged attack of two slashes, a collision and two plunges, Stellar Restoration with its Lightning Stiletto's recast, and Starward Sword's initial hit, eight slashes and final strike. Her multipliers are read from proud skill groups 4231, 4232 and 4239; the charged attack's stamina a second, the skill's recast and cooldown, and the burst's cooldown and energy cost are read from the same groups. The recast is a follow-up press inside the Stiletto's five seconds and twenty frames, and from Ascension 1, Thundering Penance, it infuses her attacks with Electro for five seconds as it lands, the shared infusion; below Ascension 1 it infuses nothing. Starward Sword's ten hits are Electro under the burst's internal cooldown, on a circle of radius 8 round her body. Her Ascension 4 passive, Starward Sword's CRIT Rate and Energy Recharge, is built. Her constellations are not built, as no kit event reaches a value the fetched sources give. The skill's and the charged attack's gauge and frames, every reach on a target, and the plunges are provisional. The infusion's five seconds are the talent table's, where gcsim holds it twenty frames longer.

## Decisions

- **Keqing's Stiletto recast is a press inside a window, and her Starward Sword slashes are priced by their own hitmarks.** gcsim spaces the eight slashes 11 frames apart from 82; each is its own hit under the burst's internal cooldown, so the slashes are not one hit repeated. The recast's infusion is the shared infusion.

## Key files

| File                                                              | Role                                                                                                                                                              |
| :---------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/keqingKit.ts` | `createKeqingKitBehaviour`, Keqing's kit with Stellar Restoration and its Lightning Stiletto's recast and infusion, and Starward Sword's slashes and final strike |

## Sources

- [gcsim v2.47.2](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/keqing), MIT: the kit's hitmarks, cancel frames and areas, Stellar Restoration and its recast's frames and circles, Starward Sword's hitmarks and circle, and the burst's cooldown and energy cost.
