# Illuga

Illuga's kit is its record and one behaviour module, `createIllugaKitBehaviour`, avatar 10000127. gcsim has no folder for Illuga at v2.47.2, so Illuga's record follows [the kits index](../README.md).

## Decisions

- **Illuga borrows Xiao's, Keqing's, Xiangling's and Bennett's hitmarks and areas, provisional.** His strikes and charged attack take Xiao's, his Press Keqing's, and his burst Xiangling's. His plunges and collision borrow Bennett's hitmarks and areas, as `NoActionFile`.
- **Illuga's Press reads its "Press DMG" label for two hits, and his burst its "Skill DMG" label for two.**

## Not built

- **His skill's Hold is waiting on its record.** The Hold's "Hold DMG" label is a row Illuga's record does not read yet, so pressing or holding his skill deals the Press hits alone.

## Key files

| File                                                              | Role                                                              |
| :---------------------------------------------------------------- | :---------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/illugaKit.ts` | `createIllugaKitBehaviour`, with no behaviour of Illuga's own yet |
| `packages/genshin-world/src/data/kits/illuga.json`                | Illuga's overlay                                                  |

## Sources

- [Illuga](https://genshin-impact.fandom.com/wiki/Illuga) and [Category:Illuga Talents](https://genshin-impact.fandom.com/wiki/Category:Illuga_Talents), Genshin Impact Wiki: Illuga's multipliers, energy, cooldowns and costs.
- Illuga's clips, `Ani_Avatar_Boy_Pole_Illuga_*`, read with `genshin:assets timings` from the installed game.
- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/xiao), MIT at v2.47.2: Xiao's strike hitmarks and areas for Illuga, [Keqing](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/keqing)'s for his Press and [Xiangling](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/xiangling)'s for his burst.
