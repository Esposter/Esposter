---
title: Eula
description: Eula's kit as built: her strikes, charged attack and plunges, Icetide Vortex's press and hold, and Glacial Illumination with the Lightfall Sword and its Grimheart stacks, with Constellation 2's hold cooldown, Ascension 4's reset and Constellation 6's random stack left unbuilt.
---

# Eula

Eula's kit is one module, `createEulaKit`, avatar 10000051: five strikes, a charged attack, a collision and two plunges, Icetide Vortex's press and its hold, and Glacial Illumination with the Lightfall Sword. Her multipliers are read from proud skill groups 5131, 5132 and 5139; the charged attack's stamina, the press's and the hold's cooldowns, and the burst's seconds, cooldown and energy cost are read from the same groups. A press's strike gains a Grimheart stack, up to two, for 18 seconds, and the hold spends the stacks into one Icewhirl each, which shreds the enemy's Cryo and Physical RES for 7 seconds per stack. Two stacks raise a Shattered Lightfall Sword at Ascension 1, and Ascension 4 gives a stack at the burst while one is up. Eula's strikes gain the Lightfall Sword a stack every 0.1 seconds while it is lit, up to 30, and a swap of characters explodes it 35 frames on, as gcsim's does. Constellation 1's Physical DMG Bonus, Constellation 4's bonus to Glacial Illumination's initial hit against an enemy under half its HP, and Constellation 6's five starting stacks are built. Constellation 2's hold cooldown, Ascension 4's reset of the hold's cooldown and Constellation 6's random extra stack are not, as the kit sets no cooldown per constellation and reads no reset. The charged attack's hits and the hold's minimum seconds are provisional.

## Key files

| File                                                            | Role                                                                                                                                                              |
| :-------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/eulaKit.ts` | `createEulaKit`, Eula's kit with her Grimheart stacks and Icewhirls, Glacial Illumination's Lightfall Sword and its explosion, her charged attack and her plunges |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/main/internal/characters/eula), MIT: Eula's strikes' hitmarks, cancel frames and poise, Icetide Vortex's press and hold frames, hits and cooldowns, its Icewhirls and shred, Grimheart's stacks and ICD, Glacial Illumination's frames, Lightfall Sword timings and stack gains, and Constellations 1, 4 and 6.
