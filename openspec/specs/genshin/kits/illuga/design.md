# Illuga

Illuga's kit is its record and one behaviour module, `createIllugaKitBehaviour`, avatar 10000127. gcsim has no folder for Illuga at v2.47.2, so Illuga's record follows [the kits index](../README.md).

## Decisions

- **Illuga is a pole user.** The installed game's avatar table gives his `weaponType` as `WEAPON_POLE`.
- **His Press keeps Keqing's skill as its donor, a judgment call for the coordinator.** Keqing's Lightning Stiletto is a thrown projectile, the nearest shape to Aedon's flight, but Illuga's Tap is a dash toward enemies in front, so the shape only partly matches.
- **His Hold DMG borrows its action frames and first hit's area from Zhongli's pole hold.** Zhongli's hold (10000030) is 96 frames with one hit at a 48-frame hitmark and a 0.5-second minimum. The record gives no shape to choose among pole holds, so Zhongli's, the first one tried, is a tie-break the coordinator should confirm. Both of Illuga's Hold hits take the donor's first area, and their hitmarks are its 48 spread over the action (24 and 48), Unsourced. Its element is Geo, Unsourced, as the wiki reads Aedon's dash. Its minimum held seconds borrow the same hold's, replacing the unmeasured 0.5.
- **Illuga borrows Xiao's, Keqing's, Xiangling's and Bennett's hitmarks and areas, provisional.** His strikes and charged attack take Xiao's, his Press Keqing's, and his burst Xiangling's. His plunges and collision borrow Bennett's hitmarks and areas, as `NoActionFile`.
- **Illuga's Press reads its "Press DMG" label for two hits, and his burst its "Skill DMG" label for two.**

## Not built

- **The Oriole-Song hooks wait on the shared stack service.** The stack service is built; his burst, second and fourth constellations do not yet hook into it.

## Key files

| File                                                              | Role                                                              |
| :---------------------------------------------------------------- | :---------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/illugaKit.ts` | `createIllugaKitBehaviour`, with no behaviour of Illuga's own yet |
| `packages/genshin-world/src/data/kits/illuga.json`                | Illuga's overlay                                                  |

## Sources

- [Illuga](https://genshin-impact.fandom.com/wiki/Illuga) and [Category:Illuga Talents](https://genshin-impact.fandom.com/wiki/Category:Illuga_Talents), Genshin Impact Wiki: Illuga's multipliers, energy, cooldowns and costs, and the Dawnbearing Songbird text read from the category page.
- Illuga's clips, `Ani_Avatar_Boy_Pole_Illuga_*`, read with `genshin:assets timings` from the installed game.
- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/xiao), MIT at v2.47.2: Xiao's strike hitmarks and areas for Illuga, [Keqing](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/keqing)'s for his Press and [Xiangling](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/xiangling)'s for his burst.
- The built record of Zhongli (10000030), for the Hold's donor above.
