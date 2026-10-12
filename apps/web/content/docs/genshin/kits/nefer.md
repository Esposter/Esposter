---
title: Nefer
description: Nefer's kit as built: her four strikes, charged attack, plunges, Shadow Dance's skill and burst, with the timings and hitmarks provisional and her Phantasm Performance not built.
---

# Nefer

Nefer's kit is its record and one behaviour module, `createNeferKitBehaviour`, avatar 10000122: four normal attacks of one, one, two and one hits, a charged attack, a collision and two plunges, a skill of two hits and a burst of four. Her strikes', charged attack's, plunges' and burst's multipliers are read from her proud skill groups, and her skill's multipliers from its own labels.

gcsim has no folder for Nefer at v2.47.2, so no value comes from gcsim. Her record is built from the tables, the wiki and her overlay, and most of her frames, hitmarks and areas are provisional.

## Decisions

- **Frames come from the clips' durations, as totals only.** The clips carry no events, so no event is read as a hit or a cancel. Each action's frames are its clip's length at 60 a second: the normal attacks `Attack_01` to `Attack_04` (4.1, 4.233, 3.667 and 5.333 seconds), the charged attack `ExtraAttack_AS` (3.167), the low plunge `FallingAttack_Strike` (0.1), the high plunge `FallingAttack_Strike_AS` (2.567), the skill `ElementalArt` (0.6) and the burst `ElementalBurst` (1.6).
- **Hitmarks and areas are Nahida's and Keqing's, provisional.** Her strikes and skill take Nahida's hit frames and areas, the burst Keqing's, as two donors of the same weapon and role family. Her hitmarks are not hers, and a recording of her strikes settles them.
- **Multipliers come from the table, by label position.** Each hit's multiplier is the proud group position its table label names: the normal attacks' 1-Hit to 4-Hit labels, the charged attack's, the plunges', the skill's "Skill DMG" and the burst's "1-Hit DMG" and "2-Hit DMG".
- **Energy, cooldowns and costs are the table's.** Her burst costs 60 energy and cools for 15 seconds, her charged attack costs 50 stamina, and her skill cools for 9 seconds.

## Not built

- **Her Phantasm Performance is waiting on its record.** Her Shadow Dance and its Phantasm Performance hits (the Nefer and Shades strikes, and their charges) are separate table labels the kit does not read yet, so her skill plays its 0.6-second animation and deals the two hits above, not the performance.
- **Her passives wait on their hooks.** Nefer's passives read the Shadow Dance state and the party's Ascension of Shade, which no kit reads yet.

## Key files

| File                                                             | Role                                                                                                |
| :--------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/neferKit.ts` | `createNeferKitBehaviour`, Nefer's module, built on her record and with no behaviour yet            |
| `packages/genshin-world/src/data/kits/nefer.json`                | Nefer's overlay: the frames, areas, hitmarks and skill and burst hit counts her sources do not give |

## Sources

- [Nefer](https://genshin-impact.fandom.com/wiki/Nefer) and the other talent pages in [Category:Nefer Talents](https://genshin-impact.fandom.com/wiki/Category:Nefer_Talents), Genshin Impact Wiki, read through the wiki's [MediaWiki API](https://genshin-impact.fandom.com/api.php): her normal attacks' Skill DMG, charged attack, plunges, skill and burst, and her energy, cooldowns and costs.
- The animation clips, read with `genshin:assets timings` from the installed game: the durations of her `Ani_Avatar_Lady_Catalyst_Nefer_*` clips, which carry no events.
- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/nahida), MIT at v2.47.2: Nahida's normal attack and skill hitmarks and areas, which Nefer's hits take provisionally, and [Keqing](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/keqing)'s burst hitmarks and areas.
