# Linnea

Linnea's kit is its record and one behaviour module, `createLinneaKitBehaviour`, avatar 10000130. gcsim has no folder for Linnea at v2.47.2, so Linnea's record follows [the kits index](../README.md).

## Decisions

- **Linnea's record borrows from a donor the page does not yet name, and only her charged shot's timing matches Tighnari's.** Her charged shot's 94-frame animation and its landing at 96 are Tighnari's aimed shot (`aimed.go` line 31, and its 86-frame hitmark plus the 10-frame travel on lines 16 and 59). Her strikes do not match his normal attacks (`attack.go` line 16: hitmarks 14, 12 and 13 or 25, against her 24, 22 and 23), and her skill's 21-metre circle does not match his 6-metre one (`skill.go` line 48). The charged shot's area is a radius-1 circle where his is a thin box (`aimed.go` lines 86 to 91). See Provisional constants.
- **Linnea has no charged-shot clip, and her charged shot's stamina is unsourced.** Her charged shot takes its 94 frames from Tighnari's aimed shot, and its stamina is the record's `chargedAttackStamina` 0, marked `Unsourced`: both provisional.
- **Linnea's skill is three hits and a chain.** Its Lumi Pound-Pound Pummeler and Heavy Overdrive Hammer labels give its three hits (`Lumi Pound-Pound Pummeler DMG`, `Lumi Heavy Overdrive Hammer DMG` and `Lumi Million Ton Crush DMG` in `~/Esposter.noindex/cache/genshin-wiki/Category_Linnea_Talents.json`), the record's `skill.hits.length` of 3 being marked `Unsourced`. Lumi Million Ton Crush gives the follow-up of `skillChain`, the Ultimate form that repeated tapping after the skill reaches (the Gameplay Notes' five taps, in `~/Esposter.noindex/cache/genshin-wiki/Category_Linnea_Talents.json`). The chain's window is provisional: the dump gives no window number, so it is a placeholder 1 second, Unsourced (`skillChain.windowSeconds`).
- **Her burst is a heal.** Its labels give the initial and continuous healing, each a DEF share and a flat amount, and the healing duration: group 13039's first five entries (`~/Esposter.noindex/genshin-parity/text/ExcelBinOutput/ProudSkillExcelConfigData.json`) are 770.4 and 1.6 for the initial heal, 154.1 and 0.32 for the continuous one, and 12 seconds (the wiki's `initialhealingamount_1=160% DEF + 770` and `continuoushealing_1=32% DEF + 154`, `healingduration=12s`, in `~/Esposter.noindex/cache/genshin-wiki/Category_Linnea_Talents.json`). The burst deals no hit, which the record marks `Unsourced` (`burst.hits.length`). The heal's tick interval is not in the dump.
- **The sweep's causes.** gcsim has no action file for Linnea, so every frame, area and hit count her strikes, charged shot, skill, burst and plunges take from a donor is `NoActionFile` in her overlay. Her own elements, multipliers, stamina and the burst's zero hits are `Unsourced`, as no source gives them.

## Provisional constants

- **Her strikes, skill and charged shot's area have no matching donor yet.** The record's strike hitmarks (24, 22 and 23) and animations (154, 162 and 266), its skill's 21-metre circle and 60-frame animation, and its charged shot's radius-1 circle match neither Tighnari's normal attacks, skill nor aimed shot (`attack.go`, `skill.go`, `aimed.go`), and the record names no donor for them. Each is `NoActionFile` in `linnea.json`.
- **Her plunges match Bennett's hitmarks and radii, not his animations.** The low and high plunges' 36 and 38 frames and 3- and 5-metre radii are Bennett's (`bennett/plunge.go`), but their 18- and 116-frame animations are not his 67 and 68 frames.
- **The skill chain's window is a placeholder.** `skillChain.windowSeconds` is 1 second, `Unsourced`.
- **The burst's tick interval is not in the dump, and its zero hits are unsourced** (`burst.hits.length`).

## Not built

- **Lumi is not summoned yet.** Her record has no Lumi duration, and no behaviour summons Lumi.

## Key files

| File                                                              | Role                                                              |
| :---------------------------------------------------------------- | :---------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/linneaKit.ts` | `createLinneaKitBehaviour`, with no behaviour of Linnea's own yet |
| `packages/genshin-world/src/data/kits/linnea.json`                | Linnea's overlay                                                  |

## Sources

- [Linnea](https://genshin-impact.fandom.com/wiki/Linnea) and [Category:Linnea Talents](https://genshin-impact.fandom.com/wiki/Category:Linnea_Talents), Genshin Impact Wiki: Linnea's multipliers, energy, cooldowns and costs.
- Linnea's clips, `Ani_Avatar_Girl_Bow_Linnea_*`, read as the [kits README](../README.md#sources) gives.
- The game's `ProudSkillExcelConfigData` rows for Linnea's skill and burst groups (13032, 13039): her multipliers, durations, healing, cooldowns and costs, which the record reads by default.
- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/tighnari), MIT at v2.47.2: Tighnari's hitmarks, areas and his aimed shot's frames, checked against Linnea's record as Decisions and Provisional constants give. Only the charged shot's 94 frames and 96-frame landing match.
- [gcsim](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/plunge.go), MIT at v2.47.2: Bennett's plunges' hitmarks and radii, which her low and high plunges match.
- The cached game data, `~/Esposter/genshin-parity/text/ExcelBinOutput/`: skill row 11302's cooldown of 18 and group 13032's index 4 at 18, and the burst row 11305's cooldown of 15 and energy cost of 60, with group 13039's heal values.

## Open

- [ ] **Her burst deals no hit** — contradicted by `~/Esposter.noindex/cache/genshin-wiki/Category_Linnea_Talents.json`: Lumi strikes nearby opponents with Pound-Pound Pummeler in the burst.
