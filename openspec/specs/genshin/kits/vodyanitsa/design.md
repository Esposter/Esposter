# Vodyanitsa

Vodyanitsa's kit is its record and one behaviour module, `createVodyanitsaKitBehaviour`, avatar 10000140. gcsim has no folder for Vodyanitsa at v2.47.2 (its `internal/characters/` holds none at that tag), so Vodyanitsa's record follows [the kits index](../README.md).

## Decisions

- **Vodyanitsa borrows Barbara's strikes and charged attack (10000014), Columbina's skill (10000125) and Mona's burst (10000041), provisional.** Her four Hydro strikes take Barbara's four, each one hit, and her charged attack takes Barbara's single hit's area and element. Her charged attack's hitmark is not Barbara's 55 frames (`~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/barbara/charge.go` line 14): it is 41, which no source gives, so it names `NoGcsimUnit`. Her skill takes Columbina's single Hydro hit, and her burst takes Mona's (`~/Esposter.noindex/cache/genshin-wiki/Category_Vodyanitsa_Talents.json`, Koda's AoE Hydro DMG).
- **Her plunges and collision borrow Bennett's hitmarks and areas, as `NoActionFile`.** Her high plunge's impact is Hydro, as the wiki gives it (`~/Esposter.noindex/cache/genshin-wiki/Category_Vodyanitsa_Talents.json`), so that hit is Water; her low plunge is Physical. Her plunges' frames are read from her own clips. Their poise is the wiki's 100 high and 50 low (the cached Psyshkhwe Arietta page's Advanced Properties, `~/Esposter.noindex/cache/genshin-wiki/Category_Vodyanitsa_Talents.json`), where Bennett's file gives 150 and 100 (`~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/bennett/plunge.go`, lines 27 and 32). Her high plunge's Hydro impact is the cached Psyshkhwe Arietta page's "AoE Hydro DMG upon impact", and her plunges' hitmarks and areas are the record's `NoActionFile` values, open until her clips are measured.
- **Her skill scales with Max HP.** The wiki gives Rechitativ: Sonorous Dawn as 3.27% of Max HP at level 1 (the cached Rechitativ page's Skill DMG row, `skilldmg_1`, `~/Esposter.noindex/cache/genshin-wiki/Category_Vodyanitsa_Talents.json`), which is the talent multiplier of its proud group 14032, index 0 (`~/Esposter.noindex/genshin-dump-backup-6.6/ExcelBinOutput/ProudSkillExcelConfigData.json`), so its hit reads `FIGHT_PROP_HP`.
- **Her frames are open until her clips are measured.** They are her clips' durations, as the [kits README](../README.md) gives: the record holds them `NoGcsimUnit`, since no source gives them, so they stay open. Her strikes run from `Attack_01` to `Attack_04`, her charged attack is ExtraAttack, her skill ElementalArt_Strike, her burst `ElementalBurst`, and her plunges FallingAttack_Strike and FallingAttack_Strike_AS.
- **Her strikes and charged attack are Hydro** (`~/Esposter.noindex/cache/genshin-wiki/Category_Vodyanitsa_Talents.json`, Psyshkhwe Arietta's Normal Attack text).
- **The values no source gives are `NoGcsimUnit`.** Vodyanitsa has no gcsim folder, so the values her overlay holds with no source read `NoGcsimUnit` as the [kits README](../README.md#framework-decisions) gives: her frames, her charged attack's hitmark, her skill's and burst's multipliers and her skill's scaling attribute. The wiki states the high plunge's Hydro impact and Rechitativ's Max HP scaling, but the wiki and table readers join a hit to its row by the label its gcsim candidate gives, and a kit with no folder has none, so the high plunge's element reads `NoGcsimUnit` though the wiki gives it.

## Not built

- **The Song of Ages Past effect is waiting on its module.** Her press starts it (the cached Rechitativ page's info text), and its Horn of Spring's Call and healing (the page's Horn of Spring's Call DMG and Song of Ages Past healing rows) are not built, so her skill deals its press alone.
- **Her burst's Song of Ages Past bonus is not built.** The cached Koda page gives a Song of Ages Past DMG Bonus column, and Koda: Sink With Thee deals its hit alone.

## Key files

| File                                                                  | Role                                                                           |
| :-------------------------------------------------------------------- | :----------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/vodyanitsaKit.ts` | `createVodyanitsaKitBehaviour`, with no behaviour of Vodyanitsa's own yet      |
| `packages/genshin-world/src/data/kits/vodyanitsa.json`                | Vodyanitsa's overlay: frames, hitmarks, areas, elements and the Max HP scaling |

## Sources

- [Vodyanitsa](https://genshin-impact.fandom.com/wiki/Vodyanitsa) and [Category:Vodyanitsa Talents](https://genshin-impact.fandom.com/wiki/Category:Vodyanitsa_Talents), Genshin Impact Wiki: her multipliers, energy, cooldowns and costs, Psyshkhwe Arietta's four strikes, Rechitativ: Sonorous Dawn's Max HP scaling and Koda: Sink With Thee.
- Vodyanitsa's clips, `Ani_Avatar_Girl_Catalyst_Vodyanitsa_*`, read with `genshin:assets timings` from the installed game.
- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/barbara) at v2.47.2, MIT: Barbara's hitmarks and areas for Vodyanitsa's strikes and charged attack; [Columbina](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/columbina)'s for her skill; [Mona](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/mona)'s for the burst; and [Bennett](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/bennett)'s for her plunges and collision.
