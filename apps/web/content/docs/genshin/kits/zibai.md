---
title: Zibai
description: Zibai's kit as built: her four strikes, charged attack, plunges and burst's two hits, with her skill's Lunar Phase Shift not built and her timings provisional.
---

# Zibai

Zibai's kit is its record and one behaviour module, `createZibaiKitBehaviour`, avatar 10000126: four normal attacks of one, one, two and one hits, a charged attack of two hits, a collision and two plunges, and a burst of two hits. Her strikes', charged attack's, plunges' and burst's multipliers are read from her proud skill groups.

gcsim has no folder for Zibai at v2.47.2, so no value comes from gcsim. Her record is built from the tables, the wiki and her overlay, and most of her frames, hitmarks and areas are provisional.

## Decisions

- **Frames come from the clips' durations, as totals only.** The clips carry no events, so no event is read as a hit or a cancel. Each action's frames are its clip's length at 60 a second: the normal attacks `Attack_01` to `Attack_04` (5.333, 6.333, 4.833 and 7.233 seconds), the charged attack `ExtraAttack_AS` (4.4), the low plunge `FallingAttack_Strike` (0.25), the high plunge `FallingAttack_Strike_AS` (2.05), the skill `ElementalArt` (0.85) and the burst `ElementalBurst` (1.567).
- **Hitmarks and areas are Keqing's, provisional.** Her strikes and burst take Keqing's hit frames and areas, the two sword users of one weapon family. Her hitmarks are not hers, and a recording of her strikes settles them.
- **Multipliers come from the table, by label position.** Her normal attacks read the 1-Hit to 4-Hit labels, her charged attack the "Charged Attack DMG" label, her plunges the "Low/High Plunge DMG" labels, and her burst its "Skill 1-Hit DMG" and "Skill 2-Hit DMG" labels.
- **Energy, cooldowns and costs are the table's.** Her burst costs 60 energy and cools for 15 seconds, her charged attack costs 20 stamina, and her skill cools for 18 seconds.

## Not built

- **Her skill's Lunar Phase Shift is waiting on its record.** Its four-strike sequence, its charged attack, the Spirit Steed's Stride and its Lunar Phase Shift duration are separate table labels the kit does not read yet, so her skill plays its 0.85-second animation and deals no hit.
- **Her passives wait on their hooks.** Zibai's passives read her Lunar Phase Shift state and the party's stacks, which no kit reads yet.

## Key files

| File                                                             | Role                                                                                      |
| :--------------------------------------------------------------- | :---------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/zibaiKit.ts` | `createZibaiKitBehaviour`, Zibai's module, built on her record and with no behaviour yet  |
| `packages/genshin-world/src/data/kits/zibai.json`                | Zibai's overlay: the frames, areas, hitmarks and burst hit counts her sources do not give |

## Sources

- [Zibai](https://genshin-impact.fandom.com/wiki/Zibai) and the other talent pages in [Category:Zibai Talents](https://genshin-impact.fandom.com/wiki/Category:Zibai_Talents), Genshin Impact Wiki, read through the wiki's [MediaWiki API](https://genshin-impact.fandom.com/api.php): her normal attacks' Skill DMG, charged attack, plunges and burst, and her energy, cooldowns and costs.
- The animation clips, read with `genshin:assets timings` from the installed game: the durations of her `Ani_Avatar_Lady_Sword_Zibai_*` clips, which carry no events.
- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/keqing), MIT at v2.47.2: Keqing's hitmarks and areas, which Zibai's strikes and burst take provisionally.
