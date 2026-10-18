# Keqing

Keqing's kit is its record and one behaviour module, `createKeqingKitBehaviour`, on avatar 10000042: five strikes, a charged attack of two slashes, a collision and two plunges, Stellar Restoration with its Lightning Stiletto's recast, and Starward Sword's initial hit, eight slashes and final strike. Her multipliers are read from proud skill groups 4231, 4232 and 4239; the charged attack's stamina a second, the skill's recast and cooldown, and the burst's cooldown and energy cost are read from the same groups. The recast is a follow-up press inside the Stiletto's five seconds and twenty frames, and it infuses her attacks with Electro for six seconds as it lands, the shared infusion. Starward Sword's ten hits are Electro under the burst's internal cooldown, on a circle of radius 8 round her body. Her Ascension 4 passive, Starward Sword's CRIT Rate and Energy Recharge, is built. Constellations 1, 4 and 6 are built. Constellation 2 is not, and her other passives are not, as no kit event reaches a value the fetched sources give. The skill's and the charged attack's gauge and frames, the infusion's seconds, every reach on a target, and the plunges are provisional.

## Decisions

- **Keqing's Stiletto recast is a press inside a window, and her Starward Sword slashes are priced by their own hitmarks.** gcsim spaces the eight slashes 11 frames apart from 82; each is its own hit under the burst's internal cooldown, so the slashes are not one hit repeated. The recast's infusion is the shared infusion.
- **Constellation 1's recast hits are a summon's two hits.** gcsim's two Electro hits of 50% of ATK, 3 frames into the recast and at its hitmark, are a summon's hits copied from the recast's own hit with their element, talent multiplier and poise set. The wiki's point-blank condition is not checked, as gcsim does not check it.
- **Constellation 4 counts gcsim's reactions.** The Electro-related reactions are gcsim's list: Overloaded, Electro-Charged, Lunar-Charged, Superconduct, Aggravate, Quicken and Hyperbloom, with Swirl and Crystallize counting only when they are Electro. gcsim counts Hyperbloom whatever its element, and the kit does too. The framework names no Stellar Conduct reaction, so none is counted for it.
- **Constellation 6 keys its bonus by kind of action.** The start of each Normal Attack, Charged Attack, Elemental Skill and Burst gives a 6% Electro DMG Bonus from a source of its own, so a repeat of the same kind restarts it and the four kinds stack, as gcsim's per-source keys do.
- **Constellation 2 is not built.** gcsim drops an Elemental Particle from each hit on an enemy holding Electro, but a particle comes from a reaction or an enemy, and a kit's hit carries no particle drop.

## Key files

| File                                                              | Role                                                                                                                                                              |
| :---------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/keqingKit.ts` | `createKeqingKitBehaviour`, Keqing's kit with Stellar Restoration and its Lightning Stiletto's recast and infusion, and Starward Sword's slashes and final strike |

## Sources

- [gcsim v2.47.2](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/keqing), MIT: the kit's hitmarks, cancel frames and areas, Stellar Restoration and its recast's frames and circles, Constellations 1, 4 and 6 in `cons.go` and `skill.go`, Starward Sword's hitmarks and circle, and the burst's cooldown and energy cost.
