---
title: Linnea
description: Linnea's kit as built: her three strikes, charged shot, plunges, Lumi's skill hits, with her burst a healing with no hit and her charged shot's clip and stamina provisional.
---

# Linnea

Linnea's kit is its record and one behaviour module, `createLinneaKitBehaviour`, avatar 10000130: three normal attacks of one, one and one hits, a charged shot of two hits, a collision and two plunges, a skill of four hits, and a burst that heals. Her strikes', charged shot's, plunges' and skill's multipliers are read from her proud skill groups.

gcsim has no folder for Linnea at v2.47.2, so no value comes from gcsim. Her record is built from the tables, the wiki and her overlay, and most of her frames, hitmarks and areas are provisional.

## Decisions

- **Frames come from the clips' durations, as totals only.** The clips carry no events, so no event is read as a hit or a cancel. Each action's frames are its clip's length at 60 a second: the normal attacks `Attack_01` to `Attack_03` (2.567, 2.7 and 4.433 seconds), the low plunge `FallingAttack_Strike` (0.3), the high plunge `FallingAttack_Strike_AS` (1.933), the skill `ElementalArt` (1.0) and the burst `ElementalBurst` (1.5).
- **Her charged shot has no clip of its own.** Linnea has no charged-attack clip, so the charged shot takes Tighnari's charged shot's 94 frames, provisional.
- **Hitmarks and areas are Tighnari's, provisional.** Her strikes, charged shot and skill take Tighnari's hit frames and areas, as a donor of her bow weapon and role. These are not hers, and a recording of her strikes settles them.
- **Multipliers come from the table, by label position.** Her normal attacks read the 1-Hit to 3-Hit labels, her charged shot the "Fully-Charged Aimed Shot" label, her plunges the "Low/High Plunge DMG" labels, and her skill its three "Lumi" damage labels, which give four hits.
- **Her burst is a heal, so it deals no hit.** Its table labels are the healing amount, duration and cooldown, so the burst has no hit of its own.
- **Energy, cooldowns and costs are the table's.** Her burst costs 60 energy and cools for 15 seconds, and her skill cools for 18 seconds. Her charged shot costs no stamina, as the table gives no stamina cost for it: that is provisional at 0.

## Not built

- **Her skill's Lumi duration is not read.** Lumi's timed field is a separate table row, so her skill's hits are the four strikes above and no field.
- **Her passives are not read yet.** No kit reads them, so her passives add nothing to the record.

## Key files

| File                                                              | Role                                                                                       |
| :---------------------------------------------------------------- | :----------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/linneaKit.ts` | `createLinneaKitBehaviour`, Linnea's module, built on her record and with no behaviour yet |
| `packages/genshin-world/src/data/kits/linnea.json`                | Linnea's overlay: the frames, areas, hitmarks, the borrowed charged shot and her stamina   |

## Sources

- [Linnea](https://genshin-impact.fandom.com/wiki/Linnea) and the other talent pages in [Category:Linnea Talents](https://genshin-impact.fandom.com/wiki/Category:Linnea_Talents), Genshin Impact Wiki, read through the wiki's [MediaWiki API](https://genshin-impact.fandom.com/api.php): her normal attacks' Skill DMG, charged shot, plunges, skill and burst's healing, and her energy and cooldowns.
- The animation clips, read with `genshin:assets timings` from the installed game: the durations of her `Ani_Avatar_Girl_Bow_Linnea_*` clips, which carry no events and no charged-attack clip.
- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/tighnari), MIT at v2.47.2: Tighnari's normal attack, charged shot and skill hitmarks and areas, and his charged clip's 94 frames, which Linnea's charged shot takes provisionally.
