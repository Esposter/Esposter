# Illuga

Illuga's kit is its record and one behaviour module, `createIllugaKitBehaviour`, avatar 10000127. gcsim has no folder for Illuga at v2.47.2, so Illuga's record follows [the kits index](../README.md).

## Decisions

- **Illuga is a pole user.** The installed game's avatar table gives his `weaponType` as `WEAPON_POLE`.
- **His Press keeps Keqing's skill as its donor, a judgment call for the coordinator.** Keqing's Lightning Stiletto is a thrown projectile, the nearest shape to Aedon's flight, but Illuga's Tap is a dash toward enemies in front, so the shape only partly matches.
- **His Hold DMG borrows its action frames and first hit's area from Zhongli's pole hold.** Zhongli's hold (10000030) is 96 frames with one hit at a 48-frame hitmark and a 0.5-second minimum. The record gives no shape to choose among pole holds, so Zhongli's, the first one tried, is a tie-break the coordinator should confirm. Both of Illuga's Hold hits take the donor's first area, and their hitmarks are its 48 spread over the action (24 and 48), Unsourced. Its element is Geo, Unsourced, as the wiki reads Aedon's dash. Its minimum held seconds borrow the same hold's, replacing the unmeasured 0.5.
- **Illuga borrows Xiao's, Keqing's, Xiangling's and Bennett's hitmarks and areas, provisional.** His strikes and charged attack take Xiao's, his Press Keqing's, and his burst Xiangling's. His plunges and collision borrow Bennett's hitmarks and areas, as `NoActionFile`.
- **Illuga's Press reads its "Press DMG" label for two hits, and his burst its "Skill DMG" label for two.**
- **The Nightingale's Song Geo DMG bonus is read from the burst's proud group.** Its label, "Geo DMG Bonus" with the format "{param3:F1P} Elemental Mastery", is the dump's bare value 0.336 at level 1, so it is a Tables-sourced parameter with no overlay entry. Each stack spent on a Geo hit adds 33.6% of Illuga's Elemental Mastery to that hit's base damage.
- **Aedon's hit takes the burst's first hit's area, with no hitmark and no poise, Unsourced.** Constellation 2's text gives the damage, 400% of Elemental Mastery and 200% of DEF from talent 1272, but no area, hitmark or poise. The kit takes the burst's area and owes a recording of Aedon.
- **Aedon's hit deals Elemental Burst DMG.** Constellation 2's text says the damage "is considered Elemental Burst DMG", and gcsim has no folder for Illuga to say otherwise, so the summon names that kind as it casts.
- **"Nearby" reads as the deployed team, and "active party members" as the member on the field.** Torchforger's Covenant and Lightkeeper's Oath give the other deployed members; Solarhunting Wolf's 200 DEF goes to the active member only. Both readings are provisional.
- **Lightkeeper's Oath's values are the passive's and Nightmare Orioles' talent rows.** The passive's paramList is 5% CRIT Rate, 10% CRIT DMG, 50 Elemental Mastery and 20 seconds, and talent 1276 gives 10%, 30% and 80. The passive's list repeats each CRIT pair, and the kit reads one pair.

## Not built

- **The stacks Geo Constructs give Nightingale's Song are not built.** The state's gain helper exists, but the kit does not read the constructs on the field.
- **Constellation 1, the Lunar-Crystallize enhancement, is not built.** It needs his Geo reactions and their fifteen-second cooldown, which the kit does not read.
- **Vigilant Sentinel is not built.** After a Geo-related Reaction on the field, he regains 12 Elemental Energy at most once every 15 seconds, the passive the dump's TextMap gives.

## Key files

| File                                                              | Role                                                                                                                                                                     |
| :---------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/illugaKit.ts` | `createIllugaKitBehaviour`, his burst, the Nightingale's Song stacks and their Geo DMG bonus, Torchforger's Covenant's Lightkeeper's Oath, and Constellations 2, 4 and 6 |
| `packages/genshin-world/src/data/kits/illuga.json`                | Illuga's overlay                                                                                                                                                         |

## Sources

- [Illuga](https://genshin-impact.fandom.com/wiki/Illuga) and [Category:Illuga Talents](https://genshin-impact.fandom.com/wiki/Category:Illuga_Talents), Genshin Impact Wiki: Illuga's multipliers, energy, cooldowns and costs, and the Dawnbearing Songbird text read from the category page.
- Illuga's clips, `Ani_Avatar_Boy_Pole_Illuga_*`, read as the [kits README](../README.md#sources) gives.
- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/xiao), MIT at v2.47.2: Xiao's strike hitmarks and areas for Illuga, [Keqing](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/keqing)'s for his Press and [Xiangling](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/xiangling)'s for his burst.
- The built record of Zhongli (10000030), for the Hold's donor above.
- The installed game's TextMap and avatar talent table, for Illuga's constellations: Elk With Fanged Antlers (talent 1272), Solarhunting Wolf (1274) and Nightmare Orioles (1276), and the Torchforger's Covenant passive (P1272101) it enhances.
- The installed game's proud skill group 12739, Shadowless Reflection's, for the Geo DMG bonus of a stack, whose label is read from its TextMap.
