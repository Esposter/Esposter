# Zibai

Zibai's kit is its record and one behaviour module, `createZibaiKitBehaviour`, avatar 10000126. gcsim has no folder for Zibai at v2.47.2, so Zibai's record follows [the kits index](../README.md).

## Decisions

- **Zibai borrows Keqing's hitmarks and areas, provisional.** Her strikes and burst take Keqing's, a sword user of the same family.
- **Zibai's burst reads its "Skill 1-Hit DMG" and "Skill 2-Hit DMG" labels, one hit each.**

## Not built

- **Her skill's Lunar Phase Shift is waiting on its record.** Its four-strike sequence, its charged attack, the Spirit Steed's Stride and the shift's duration each have labels Zibai's record does not read yet, so her skill plays out with no hit.

## Key files

| File                                                             | Role                                                            |
| :--------------------------------------------------------------- | :-------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/zibaiKit.ts` | `createZibaiKitBehaviour`, with no behaviour of Zibai's own yet |
| `packages/genshin-world/src/data/kits/zibai.json`                | Zibai's overlay                                                 |

## Sources

- [Zibai](https://genshin-impact.fandom.com/wiki/Zibai) and [Category:Zibai Talents](https://genshin-impact.fandom.com/wiki/Category:Zibai_Talents), Genshin Impact Wiki: Zibai's multipliers, energy, cooldowns and costs.
- Zibai's clips, `Ani_Avatar_Lady_Sword_Zibai_*`, read with `genshin:assets timings` from the installed game.
- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/keqing), MIT at v2.47.2: Keqing's hitmarks and areas, which Zibai's strikes and burst take.
