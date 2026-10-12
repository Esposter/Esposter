---
title: Lohen
description: Lohen's kit as built: his five strikes, charged attack, plunges and six-hit burst, with his skill not built and his timings provisional.
---

# Lohen

Lohen's kit is its record and one behaviour module, `createLohenKitBehaviour`, avatar 10000129: five normal attacks of one, one, three, one and two hits, a charged attack of two hits, a collision and two plunges, and a burst of six hits. His strikes', charged attack's, plunges' and burst's multipliers are read from his proud skill groups.

gcsim has no folder for Lohen at v2.47.2, so no value comes from gcsim. His record is built from the tables, the wiki and his overlay, and most of his frames, hitmarks and areas are provisional.

## Decisions

- **Frames come from the clips' durations, as totals only.** The clips carry no events, so no event is read as a hit or a cancel. Each action's frames are its clip's length at 60 a second: the normal attacks `Attack_01` to `Attack_05` (4.567, 4.617, 4.95, 3.9 and 4.817 seconds), the charged attack `ExtraAttack_AS` (3.95), the low plunge `FallingAttack_Strike` (0.317), the high plunge `FallingAttack_Strike_AS` (1.783) and the burst `ElementalBurst` (1.633).
- **Hitmarks and areas are Xiangling's, provisional.** His strikes, charged attack and burst take Xiangling's hit frames and areas, as a donor of his pole weapon and role. These are not his, and a recording of his strikes settles them.
- **Multipliers come from the table, by label position.** His normal attacks read the 1-Hit to 5-Hit labels, his charged attack the "Charged Attack DMG" label, his plunges the "Low/High Plunge DMG" labels, and his burst its "Skill DMG" label, which gives six hits.
- **Energy, cooldowns and costs are the table's.** His burst costs 60 energy and cools for 15 seconds, his charged attack costs 25 stamina, and his skill cools for 18 seconds.

## Not built

- **His skill deals no hit yet.** His skill's table labels are not read by the kit, so it plays its 0.333-second animation and deals no hit.
- **His passives are not read yet.** No kit reads them, so his passives add nothing to the record.

## Key files

| File                                                             | Role                                                                                      |
| :--------------------------------------------------------------- | :---------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/lohenKit.ts` | `createLohenKitBehaviour`, Lohen's module, built on his record and with no behaviour yet  |
| `packages/genshin-world/src/data/kits/lohen.json`                | Lohen's overlay: the frames, areas, hitmarks and burst hit counts her sources do not give |

## Sources

- [Lohen](https://genshin-impact.fandom.com/wiki/Lohen) and the other talent pages in [Category:Lohen Talents](https://genshin-impact.fandom.com/wiki/Category:Lohen_Talents), Genshin Impact Wiki, read through the wiki's [MediaWiki API](https://genshin-impact.fandom.com/api.php): his normal attacks' Skill DMG, charged attack, plunges and burst, and his energy, cooldowns and costs.
- The animation clips, read with `genshin:assets timings` from the installed game: the durations of his `Ani_Avatar_Boy_Pole_Lohen_*` clips, which carry no events.
- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/xiangling), MIT at v2.47.2: Xiangling's hitmarks and areas, which Lohen's strikes, charged attack and burst take provisionally.
