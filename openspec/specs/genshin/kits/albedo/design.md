# Albedo

Albedo's kit is its record and one behaviour module, `createAlbedoKitBehaviour`, avatar 10000038: five strikes, a charged attack of two hits, a collision and two plunges, Abiogenesis: Solar Isotoma with its hit and the Transient Blossoms it sets off, and Rite of Progeniture: Tectonic Tide with its Fatal Blossoms. His multipliers are read from proud skill groups 3831, 3832 and 3839; the charged attack's stamina, the field's seconds and cooldown, and the burst's cooldown and energy cost are read from the same groups. A Transient Blossom's tick is priced by his DEF, and the Fatal Blossoms come only while the field stands. Constellation 1 is built: each Transient Blossom regenerates 1.2 Energy for Albedo, and his Solar Isotoma raises his DEF by 50% for 20 seconds. His Ascension 4 passive is built, raising the team's Elemental Mastery under Tectonic Tide. His Ascension 1 passive and Constellations 2, 4 and 6 are not built, as their enemy HP conditions, party buffs and stacks are not on the kit's effects. Constellations 1 and 2 are built: Constellation 1's energy, and Constellation 2's Fatal Reckoning, which Tectonic Tide adds to each Fatal Blossom but not to its own first hit. Constellations 4 and 6 are not built.

## Decisions

- **Transient Blossoms trigger on a hit inside the Solar Isotoma, once every 2 seconds.** gcsim's field strikes on damage in its area behind one 2-second internal cooldown, and here the hit's enemy must stand within the field's radius of 10, the tick landing at that enemy a frame later. The tick's multiple is of DEF, so its hit takes no ATK, and the Fatal Blossoms come with the burst while the field stands.
- **Fatal Blossoms take their hitmarks from one cited array, and their area is `Unsourced`.** gcsim queues the seven blossoms in a loop of "maxBlossoms" at line 96, `fatalBlossomHitmark+i*5`, inside the burst's queue with `burstHitmark` as its delay, so the overlay cites `hits.fatalBlossoms.0-6.hitmarkFrames` as one array of 145 to 175 by element. Their area is a circle of 3 on the blossom's own centre, which the hitbox reader does not resolve, and their element, gauge, cooldown tag, blunt flag and multiplier are shared by the run and `Unsourced` with the same reason.
- **Fatal Reckoning is flat damage on each Fatal Blossom, not on the burst's first hit.** gcsim adds 30% of Albedo's DEF per stack as flat damage to the burst's first hit and to the blossoms, once at the burst's start (`burst.go`, `cons.go`). The record plays the burst's first hit with no per-cast override, so only the blossoms carry the bonus, and the first hit's share is the open part of Constellation 2.

## Key files

| File                                                              | Role                                                                                                                      |
| :---------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------ |
| `packages/genshin-world/src/services/kit/characters/albedoKit.ts` | `createAlbedoKitBehaviour`, Albedo's kit with Solar Isotoma, its Transient Blossoms, Tectonic Tide and the Fatal Blossoms |

## Sources

- [gcsim v2.47.2](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/albedo), MIT: Albedo's strikes' hitmarks and cancels, the charged attack, Solar Isotoma's hit and its Transient Blossom's tick, Tectonic Tide's and the Fatal Blossoms' frames and areas, and Constellation 2's and the passives' values, read for the reach they give.
