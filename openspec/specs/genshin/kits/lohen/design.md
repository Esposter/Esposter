# Lohen

Lohen's kit is its record and one behaviour module, `createLohenKitBehaviour`, avatar 10000129. gcsim has no folder for Lohen at v2.47.2, so Lohen's record follows [the kits index](../README.md).

## Decisions

- **Lohen borrows Xiangling's hitmarks and areas, provisional.** His strikes, charged attack and burst all take hers, a polearm user of his role.
- **Lohen's burst reads its "Skill DMG" label for six hits.**

## Not built

- **His skill deals no hit yet.** Lohen's record reads none of his skill's labels, so the skill is its animation alone.

## Key files

| File                                                             | Role                                                            |
| :--------------------------------------------------------------- | :-------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/lohenKit.ts` | `createLohenKitBehaviour`, with no behaviour of Lohen's own yet |
| `packages/genshin-world/src/data/kits/lohen.json`                | Lohen's overlay                                                 |

## Sources

- [Lohen](https://genshin-impact.fandom.com/wiki/Lohen) and [Category:Lohen Talents](https://genshin-impact.fandom.com/wiki/Category:Lohen_Talents), Genshin Impact Wiki: Lohen's multipliers, energy, cooldowns and costs.
- Lohen's clips, `Ani_Avatar_Boy_Pole_Lohen_*`, read with `genshin:assets timings` from the installed game.
- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/xiangling), MIT at v2.47.2: Xiangling's hitmarks and areas, which Lohen's strikes, charged attack and burst take.
