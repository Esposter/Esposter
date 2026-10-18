# Zibai

Zibai's kit is its record and one behaviour module, `createZibaiKitBehaviour`, avatar 10000126. gcsim has no folder for Zibai at v2.47.2, so Zibai's record follows [the kits index](../README.md).

## Decisions

- **Zibai is a one-hand sword user.** The installed game's avatar table gives her `weaponType` as `WEAPON_SWORD_ONE_HAND`.
- **Her Lunar Phase Shift stance's normal and charged attacks borrow their hitmarks and areas from Skirk's sevenPhaseFlash, a one-hand sword stance.** Its first four normal attacks have one, one, two and two hits, as Zibai's do, and its charged attack has three hits, of which Zibai's two take the first two. Provisional.
- **Spirit Steed's Stride borrows its two hits from Bennett's sword hold, which has two hits.** No sword stance carries a skill, so the skill takes that hold (10000032, 98 frames, a 0.5-second minimum). The hold is a shape match only, since Spirit Steed's Stride is a skill, not a hold. Provisional.
- **The Lunar Phase Shift hits are Geo, Unsourced, as the wiki reads them:** normal and charged attacks convert to Geo DMG, and Spirit Steed's Stride deals two instances of Geo DMG, the second Lunar-Crystallize.
- **Zibai's base attacks and charged attack keep Keqing's hitmarks and areas, shape-checked.** Her normal attacks (up to four rapid strikes) and charged attack (two rapid sword strikes) carry Keqing's wording (up to five rapid strikes; two rapid sword strikes), so Keqing's donor holds. Her burst is the Jadelight Canopy, two Geo instances, and Keqing's burst is an AoE of several instances, so the form matches; the wiki gives the canopy no geometry, so the burst's 4 paths stay provisional. 16 paths in all.
- **Her burst's second instance is Lunar-Crystallize, Unsourced, from the wiki's Jadelight Canopy text.**
- **Zibai's burst reads its "Skill 1-Hit DMG" and "Skill 2-Hit DMG" labels, one hit each.**
- **Zibai's plunges and collision borrow Bennett's hitmarks and areas, as `NoActionFile`.**

## Not built

- **Her shift's entry is built; its Phase Shift Radiance is not.** Heaven and Earth Made Manifest enters the Lunar Phase Shift for her record's seconds, which the wiki gives as at most 15. Spirit Steed's Stride's cost of 70 Radiance, the shift's gains, and the Moonsign's gains from nearby Lunar-Crystallize wait on a Radiance rule her record does not carry.
- **The fourth normal attack's Moonsign gate is not built.** Her stance hit is gated in behaviour, and the wiki text for that gate is not yet read into the record.
- **The second instance of Spirit Steed's Stride is Lunar-Crystallize.** Its hit's `lunarReactionType` is `LunarCrystallize`, Unsourced, from the wiki's Lunar Phase Shift text, which says the second instance is Lunar-Crystallize Reaction DMG. The hit keeps its Geo element, and its scaling stat is not read yet.

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
