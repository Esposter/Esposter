# Illuga

Illuga's kit is its record and one behaviour module, `createIllugaKitBehaviour`, avatar 10000127. gcsim has no folder for Illuga at v2.47.2, so Illuga's record follows [the kits index](../README.md).

## Decisions

- **Illuga is a pole user.** The installed game's avatar table gives his `weaponType` as `WEAPON_POLE`.
- **His Press keeps Keqing's skill as its donor, a judgment call for the coordinator.** Keqing's Lightning Stiletto is a thrown projectile, the nearest shape to Aedon's flight, but Illuga's Tap is a dash toward enemies in front, so the shape only partly matches.
- **His Hold DMG borrows its action frames and first hit's area from Zhongli's pole hold.** Zhongli's hold (10000030) is 96 frames with one hit at a 48-frame hitmark and a 0.5-second minimum. The record gives no shape to choose among pole holds, so Zhongli's, the first one tried, is a tie-break the coordinator should confirm. Both of Illuga's Hold hits take the donor's first area, and their hitmarks are its 48 spread over the action (24 and 48), Unsourced. Its element is Geo, Unsourced, as the wiki reads Aedon's dash. Its minimum held seconds borrow the same hold's, replacing the unmeasured 0.5.
- **Illuga borrows Xiao's, Keqing's, Xiangling's and Bennett's hitmarks and areas, provisional.** His strikes and charged attack take Xiao's, his Press Keqing's, and his burst Xiangling's. His plunges and collision borrow Bennett's hitmarks and areas, as `NoActionFile`.
- **Illuga's Press reads its "Press DMG" label for two hits, and his burst its "Skill DMG" label for two.**

## Not built

- **His burst starts Haunted Night's Oriole-Song, and that is built.** Shadowless Reflection starts it for 20 seconds with 21 stacks of Nightingale's Song, both as the wiki's talent text gives them, through the shared stack service.
- **Nightingale's Song's stacks are spent on the Geo hits nearby active party members land on an enemy, one stack a hit.** Illuga's own hits do not spend them. The Geo DMG bonus a stack gives is not built: the wiki gives it as a share of Illuga's Elemental Mastery, and neither the wiki cache nor the dump's TextMap holds its base rate.
- **Constellations 2 and 4 are not built, and their texts are the dump's.** Constellation 2 is Elk With Fanged Antlers, read from the installed game's TextMap by its description hash, 3921016055: for every 7 stacks consumed, Aedon summons one Geo hit of 400% of Illuga's Elemental Mastery and 200% of his DEF on 1 nearby opponent, as Elemental Burst DMG. That hit has no record, so it is not built. Constellation 4 is Solarhunting Wolf, read by description hash 2798755983: while Haunted Night's Oriole-Song is active, nearby active party members gain 200 DEF, which is not built. The earlier note that it needs the Oriole-Song stacks and damage was wrong.

## Key files

| File                                                              | Role                                                                    |
| :---------------------------------------------------------------- | :---------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/illugaKit.ts` | `createIllugaKitBehaviour`, his burst and the Nightingale's Song stacks |
| `packages/genshin-world/src/data/kits/illuga.json`                | Illuga's overlay                                                        |

## Sources

- [Illuga](https://genshin-impact.fandom.com/wiki/Illuga) and [Category:Illuga Talents](https://genshin-impact.fandom.com/wiki/Category:Illuga_Talents), Genshin Impact Wiki: Illuga's multipliers, energy, cooldowns and costs, and the Dawnbearing Songbird text read from the category page.
- Illuga's clips, `Ani_Avatar_Boy_Pole_Illuga_*`, read with `genshin:assets timings` from the installed game.
- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/xiao), MIT at v2.47.2: Xiao's strike hitmarks and areas for Illuga, [Keqing](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/keqing)'s for his Press and [Xiangling](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/xiangling)'s for his burst.
- The built record of Zhongli (10000030), for the Hold's donor above.
- The installed game's TextMap and avatar talent table, for Illuga's constellations: Elk With Fanged Antlers (talent 1272) and Solarhunting Wolf (1274).
