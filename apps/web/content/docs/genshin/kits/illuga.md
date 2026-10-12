---
title: Illuga
description: Illuga's kit as built: his four strikes, charged attack, plunges, Press of his skill and burst's two hits, with his skill's Hold not built and his timings provisional.
---

# Illuga

Illuga's kit is its record and one behaviour module, `createIllugaKitBehaviour`, avatar 10000127: four normal attacks of one, one, two and one hits, a charged attack of one hit, a collision and two plunges, a skill's Press of two hits, and a burst of two hits. His strikes', charged attack's, plunges' and burst's multipliers are read from his proud skill groups, and his Press from its own labels.

gcsim has no folder for Illuga at v2.47.2, so no value comes from gcsim. His record is built from the tables, the wiki and his overlay, and most of his frames, hitmarks and areas are provisional.

## Decisions

- **Frames come from the clips' durations, as totals only.** The clips carry no events, so no event is read as a hit or a cancel. Each action's frames are its clip's length at 60 a second: the normal attacks `Attack_01` to `Attack_04` (3.167, 3.067, 4.133 and 5.867 seconds), the charged attack `ExtraAttack_AS` (1.767), the low plunge `FallingAttack_Strike` (0.317), the high plunge `FallingAttack_Strike_AS` (1.783), the skill `ElementalArt` (0.533) and the burst `ElementalBurst` (1.033).
- **Hitmarks and areas are Xiao's, Keqing's and Xiangling's, provisional.** His strikes take Xiao's hit frames and areas, his Press Keqing's, and his burst Xiangling's, as donors of his weapon and role. These are not his, and a recording of his strikes settles them.
- **Multipliers come from the table, by label position.** His normal attacks read the 1-Hit to 4-Hit labels, his charged attack the "Charged Attack DMG" label, his plunges the "Low/High Plunge DMG" labels, his Press the "Press DMG" label, and his burst its "Skill DMG" label.
- **Energy, cooldowns and costs are the table's.** His burst costs 60 energy and cools for 15 seconds, his charged attack costs 25 stamina, and his skill cools for 15 seconds.

## Not built

- **His skill's Hold is waiting on its record.** The Hold's "Hold DMG" label is a separate table row the kit does not read yet, so his press deals its Press hits and no Hold.
- **His passives are not read yet.** No kit reads them, so his passives add nothing to the record.

## Key files

| File                                                              | Role                                                                                                 |
| :---------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/illugaKit.ts` | `createIllugaKitBehaviour`, Illuga's module, built on his record and with no behaviour yet           |
| `packages/genshin-world/src/data/kits/illuga.json`                | Illuga's overlay: the frames, areas, hitmarks and skill and burst hit counts her sources do not give |

## Sources

- [Illuga](https://genshin-impact.fandom.com/wiki/Illuga) and the other talent pages in [Category:Illuga Talents](https://genshin-impact.fandom.com/wiki/Category:Illuga_Talents), Genshin Impact Wiki, read through the wiki's [MediaWiki API](https://genshin-impact.fandom.com/api.php): his normal attacks' Skill DMG, charged attack, plunges, Press and burst, and his energy, cooldowns and costs.
- The animation clips, read with `genshin:assets timings` from the installed game: the durations of his `Ani_Avatar_Boy_Pole_Illuga_*` clips, which carry no events.
- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/xiao), MIT at v2.47.2: Xiao's normal attack hitmarks and areas, which Illuga's strikes take provisionally, and [Xiangling](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/xiangling)'s burst hitmarks and areas.
