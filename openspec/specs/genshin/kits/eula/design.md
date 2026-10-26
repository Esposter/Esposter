# Eula

Eula's kit is its record and one behaviour module, `createEulaKitBehaviour`, avatar 10000051: five strikes, a charged attack, a collision and two plunges, Icetide Vortex's press and its hold, and Glacial Illumination with the Lightfall Sword. Her multipliers are read from proud skill groups 5131, 5132 and 5139; the charged attack's stamina, the press's and the hold's cooldowns, and the burst's seconds, cooldown and energy cost are read from the same groups. A press's strike gains a Grimheart stack, up to two, for 18 seconds, and the hold spends the stacks into one Icewhirl each, which shreds the enemy's Cryo and Physical RES for 7 seconds per stack. Two stacks raise a Shattered Lightfall Sword at Ascension 1, and from Ascension 4 the burst gives a stack while one is up and resets Icetide Vortex's cooldown, written to her party member's skill cooldown as gcsim's `a4` resets it. Eula's strikes gain the Lightfall Sword a stack every 0.1 seconds while it is lit, up to 30, and a swap of characters explodes it 35 frames on, as gcsim's does. Constellation 1's Physical DMG Bonus, Constellation 4's bonus to Glacial Illumination's initial hit against an enemy under half its HP, and Constellation 6's five starting stacks and its random extra stack are built. The extra stack is a 50% roll on each stack gained, as gcsim's burstStackCB rolls it (`burst.go` line 154, in the function from line 130). Constellation 2's hold cooldown is not built, as the kit sets no cooldown per constellation and no source gives the hold's cooldown. The charged attack's hits and the hold's minimum seconds are provisional.

## Decisions

- **Eula's charged attack lands its spin at half a second and its final hit at one second, in 1.5 seconds.** Provisional, as gcsim leaves the charged attack unimplemented, so the table's seconds stand until a recording reads others.
- **Icetide Vortex's hold begins at half a second.** Provisional, as gcsim takes any hold from the input alone.
- **Icetide Vortex's hold strikes at the skill's Hold DMG, index 1 of its group.** gcsim's `skillHold` array copies the burst's Skill DMG, 245.6% at level 1, and its talent config labels it so, which would deal the hold at the burst's multiplier; the overlay holds the skill's own index as `DiffersFromSource`.

## Key files

| File                                                            | Role                                                                                                                                                                       |
| :-------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/eulaKit.ts` | `createEulaKitBehaviour`, Eula's kit with her Grimheart stacks and Icewhirls, Glacial Illumination's Lightfall Sword and its explosion, her charged attack and her plunges |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/eula), MIT: the kit's hitmarks, cancel frames and areas, Icetide Vortex's press and hold frames, hits and cooldowns, its Icewhirls and shred, Grimheart's stacks and ICD, Glacial Illumination's frames, Lightfall Sword timings and stack gains, and Constellations 1, 4 and 6.
- The wiki, where gcsim states neither: the plunge collision's poise, 35, and the normal attacks' internal cooldown tag, `NormalAttack`.
