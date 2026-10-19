# Aloy

Aloy's kit is its record and one behaviour module, `createAloyKitBehaviour`, avatar 10000062: four strikes, a fully charged shot, a collision and two plunges, and Freeze Bomb with its two Chillwater Bomblets, each of which adds a coil stack, four of them giving Cryo infusion for Rushing Ice's ten seconds. Her multipliers are read from proud skill groups 6231, 6232 and 6239; the skill's cooldown, and the burst's cooldown and energy cost, are read from the same groups. Freeze Bomb's circle and the bomblets' are priced as the targeting reach plus their radius, and Prophecies of Dawn's circle as its offset plus its radius. Her coil stacks are not cleared 30 seconds after she leaves the field, since a kit's status holds no field state. Her Ascension 1 and Ascension 4 passives are built as Rushing Ice's ATK and Cryo DMG Bonus. Her constellations are not built, as the game cannot activate them, and her Coil and Rushing Ice normal attack bonuses are not built, as a normal attack's damage bonus has no hook in the kit yet. Her poise is the wiki's.

## Decisions

- **Aloy's strikes take the wiki's 7.65 for each hit of the first, 14.7 for the second, 18 for the third and 22.38 for the fourth, her fully charged shot the wiki's 20, her burst the wiki's 200, her collision the wiki's 10 and her plunges the wiki's 100 high and 50 low; Freeze Bomb's own hit takes the wiki's 120, and its Chillwater Bomblets the wiki's 50 each.** Her plunge reaches and 0.4-second landing are the stand-ins other kits use.
- **Each Chillwater Bomblet adds one coil stack per enemy it strikes, and Freeze Bomb and each bomblet give 1U of Cryo.** gcsim counts a bomblet once for all its enemies and gives Freeze Bomb no gauge, so `aloyKit.ts` counts each enemy and reads 1U as Ganyu's Cryo hits do.
- **Freeze Bomb's hit count is `DiffersFromSource`.** The three hits are one bomb and the bomblets of the loop at "skill.go" line 96, which runs to "bomblets", defaulted to 2 at line 52, and no reader counts a loop's hits, so the count of 3 stays hand-set. The bomblets' hitmarks are cited from line 101, "skillRelease+travel+delay+((i+1)*6)" evaluated per bomblet.
- **Aloy's Ascension 1 and 4 passives run from the start of Rushing Ice.** From Ascension 1 Rushing Ice raises the ATK of the deployed team by 8%, and Aloy's own by 8% more, for its ten seconds. From Ascension 4 her Cryo DMG Bonus rises 3.5% each second, as gcsim's stacks do, to 35% at the tenth; each step restarts one buff that ends with Rushing Ice.

## Key files

| File                                                            | Role                                                                                                                                                                                    |
| :-------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/aloyKit.ts` | `createAloyKitBehaviour`, Aloy's kit with Freeze Bomb and its Chillwater Bomblets' coil stacks and Rushing Ice, and her strikes, fully charged shot and plunges, and Prophecies of Dawn |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/aloy), MIT: Aloy's strikes' hitmarks, travel and cancel frames, the fully charged shot's frames, Freeze Bomb's frames, its bomblets' hitmarks and circles, the coil stacks and Rushing Ice's threshold, and Prophecies of Dawn's frames and circle.
- [Rapid Fire](https://genshin-impact.fandom.com/wiki/Rapid_Fire), [Frozen Wilds](https://genshin-impact.fandom.com/wiki/Frozen_Wilds) and [Prophecies of Dawn](https://genshin-impact.fandom.com/wiki/Prophecies_of_Dawn), Genshin Impact Wiki: the poise of Freeze Bomb and its bomblets and of Prophecies of Dawn, and of her plunges, collision, strikes and fully charged shot.
