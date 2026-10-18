# Zibai

Zibai's kit is its record and one behaviour module, `createZibaiKitBehaviour`, avatar 10000126. gcsim has no folder for Zibai at v2.47.2, so Zibai's record follows [the kits index](../README.md).

## Decisions

- **Zibai is a one-hand sword user.** The installed game's avatar table gives her `weaponType` as `WEAPON_SWORD_ONE_HAND`.
- **Her Lunar Phase Shift stance's normal and charged attacks borrow their hitmarks and areas from Skirk's sevenPhaseFlash, a one-hand sword stance.** Its first four normal attacks have one, one, two and two hits, as Zibai's do, and its charged attack has three hits, of which Zibai's two take the first two. Provisional.
- **Spirit Steed's Stride borrows its two hits from Bennett's sword hold, which has two hits.** No sword stance carries a skill, so the skill takes that hold (10000032, 98 frames, a 0.5-second minimum). The hold is a shape match only, since Spirit Steed's Stride is a skill, not a hold. Provisional.
- **The Lunar Phase Shift hits are Geo, Unsourced, as the wiki reads them:** normal and charged attacks convert to Geo DMG, and Spirit Steed's Stride deals two instances of Geo DMG, the second Lunar-Crystallize.
- **Zibai's base burst, base charged attack and the first hits of her base normal attacks still borrow Keqing's hitmarks and areas, 16 paths in all.** Those paths were Keqing's before this change, and their shape against Zibai's burst is not yet checked.
- **Zibai's burst reads its "Skill 1-Hit DMG" and "Skill 2-Hit DMG" labels, one hit each.**
- **Zibai's plunges and collision borrow Bennett's hitmarks and areas, as `NoActionFile`.**

## Not built

- **Lunar Phase Shift's behaviour waits on the side branch.** The fourth normal attack's Moonsign gate, and the second instance of Spirit Steed's Stride as Lunar-Crystallize, are behaviour, not record.

## Key files

| File                                                             | Role                                                            |
| :--------------------------------------------------------------- | :-------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/zibaiKit.ts` | `createZibaiKitBehaviour`, with no behaviour of Zibai's own yet |
| `packages/genshin-world/src/data/kits/zibai.json`                | Zibai's overlay                                                 |

## Sources

- [Zibai](https://genshin-impact.fandom.com/wiki/Zibai) and [Category:Zibai Talents](https://genshin-impact.fandom.com/wiki/Category:Zibai_Talents), Genshin Impact Wiki: Zibai's multipliers, energy, cooldowns and costs, and the Lunar Phase Shift and Spirit Steed's Stride text read from the category page.
- Zibai's clips, `Ani_Avatar_Lady_Sword_Zibai_*`, read with `genshin:assets timings` from the installed game.
- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/keqing), MIT at v2.47.2: Keqing's hitmarks and areas, which Zibai's base burst, base charged attack and base normal attacks take.
- The built records of Skirk (10000114) and Bennett (10000032), for the stance and hold donors above.
