# Kaeya

Kaeya's kit is its record and one behaviour module, `createKaeyaKitBehaviour`, on avatar 10000015 (`~/Esposter.noindex/genshin-dump-backup-6.6/ExcelBinOutput/AvatarExcelConfigData.json`): five strikes (`~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/kaeya/attack.go:16`), a charged attack (`~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/kaeya/charge.go:16`), a collision and two plunges (`~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/kaeya/plunge.go`), Frostgnaw with its A1 heal (`~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/kaeya/skill.go:46`), and Glacial Waltz's thirteen icicles (`~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/kaeya/burst.go:45`). Its multipliers are read from proud skill groups 1531, 1532 and 1539 (`~/Esposter.noindex/genshin-dump-backup-6.6/ExcelBinOutput/ProudSkillExcelConfigData.json`), and match gcsim's to six decimal places (`~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/kaeya/zz_kaeya.dm.go`) and the wiki's Ceremonial Bladework, Frostgnaw and Glacial Waltz values to two decimal places (`~/Esposter.noindex/cache/genshin-wiki/Category_Kaeya_Talents.json`). Glacial Waltz's icicles are a summon, built as the [shared effects](../README.md).

## Decisions

- **Kaeya's groups are 1531, 1532 and 1539, not the talent table's 2531 and 2539.** The table names 2531 for his strikes and 2539 for his icicle, and their level-1 values, 46.6% for the first strike and 54.3% for the icicle, agree with neither the wiki nor gcsim. The 15xx groups carry the wiki's numbers: proud 1531's index 0 is 0.5375 (`~/Esposter.noindex/genshin-dump-backup-6.6/ExcelBinOutput/ProudSkillExcelConfigData.json`), the wiki's first-strike row `hit1_1` is 53.75 (`~/Esposter.noindex/cache/genshin-wiki/Category_Kaeya_Talents.json`), and gcsim's `~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/kaeya/zz_kaeya.dm.go` line 38 is 0.5375, so the kit reads those; the stats run's choice of group for him is the thing to fix.
- **Frostgnaw's cooldown is the wiki's 6 seconds.** The skill table's 21 seconds is held in Open, as it was not read here; the proud skill group 1532's index 1 holds the 6 (`~/Esposter.noindex/genshin-dump-backup-6.6/ExcelBinOutput/ProudSkillExcelConfigData.json`), as gcsim's 360 frames do (`~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/kaeya/skill.go` line 68). Frostgnaw's damage against Water, its 4U gauge, is not built. A1's heal is built as a hit's `healAttackShare`: each enemy Frostgnaw strikes heals Kaeya by 15% of his ATK, read as the hit is priced (gcsim `~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/kaeya/skill.go` lines 46 to 54, the A1 heal at Ascension 1).
- **Ascension 4's Glacial Heart is built from the wiki's text, with no cooldown and two particles a use.** An opponent Frozen by Frostgnaw drops one Elemental Particle, and the wiki (`~/Esposter.noindex/cache/genshin-wiki/Category_Kaeya_Talents.json`) caps a use of Frostgnaw at two, so each use sets two holds that each freeze spends, restarted by the next use. The wiki gives no element for the particle; gcsim's Glacial Heart drops it as Cryo (`~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/kaeya/skill.go` line 114), and its per-use cap of two is its `a4Count` (`~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/kaeya/skill.go` lines 94 to 114). No cooldown is kept, as the wiki states none. Only a freeze by the skill counts, not one by a hit of another attack.
- **Kaeya's reaches are priced with their offsets.** Its strikes, charge and plunges are priced a metre or so ahead of the body (`~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/kaeya/attack.go:19`, `~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/kaeya/charge.go:17`, `~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/kaeya/plunge.go`).

- **Constellation 6's Energy on the cast is built.** gcsim (MIT) `~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/kaeya/burst.go` gives 15 Energy 52 frames after the cast at Constellation 6 (lines 67 and 68), which the kit schedules as a task on the burst's start.

## Not built

- **Constellation 6's fourth icicle is not built.** Its extra icicle sets the icicles' spacing to 120 frames over four, not three (`~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/kaeya/burst.go` lines 51 and 55, `offset := 120 / count`), and the record's icicle hits are timed for three, so they do not give it. Constellation 2 is built: each enemy defeated during Glacial Waltz extends it by 2.5 seconds, up to 15 seconds in all (`~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/kaeya/cons.go` line 39), as the kit hears `EnemyDefeated`.
- **Glacial Waltz's activation knockback is not built.** Its 400 poise is the wiki's Glacial Waltz poise row, with no damage, and no area for it is cited, so the icicles alone are built; the area is in Open.

## Open

- **The talent table's 21-second skill duration.** The page says the table gives 21 seconds for his skill and that it is not the cooldown; this pass did not read that row, so the figure has no source here beyond the table's own note.
- **Glacial Waltz's knockback area.** Its 400 poise is the wiki's, but no area is cited for the activation knockback, so it has no source for where it strikes.

- [ ] **Glacial Waltz's thirteen icicles** — contradicted by `~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/kaeya/burst.go`: three icicles, with thirteen ticks in all.
- [ ] **Kaeya's strikes priced a metre or so ahead** — contradicted by `~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/kaeya/attack.go`: its offsets run from -0.2 to 1.2 metres.

## Key files

| File                                                             | Role                                                                |
| :--------------------------------------------------------------- | :------------------------------------------------------------------ |
| `packages/genshin-world/src/services/kit/characters/kaeyaKit.ts` | `createKaeyaKitBehaviour`, Kaeya's kit with Glacial Waltz's icicles |

## Sources

- [Ceremonial Bladework](https://genshin-impact.fandom.com/wiki/Ceremonial_Bladework), [Frostgnaw](https://genshin-impact.fandom.com/wiki/Frostgnaw) and [Glacial Waltz](https://genshin-impact.fandom.com/wiki/Glacial_Waltz), Genshin Impact Wiki: Kaeya's strikes', charged attack's and plunges' poise, Frostgnaw's gauge and poise, and Glacial Waltz's icicle damage, gauge and poise.
- [gcsim v2.47.2](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/kaeya), MIT: the kit's hitmarks, cancel frames and areas, the icicles' ticks, and the values its talent file gives, which its multipliers match.
- [gcsim v2.47.2 skill file](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/kaeya/skill.go), MIT: Frostgnaw's A1, the heal of 15% of Kaeya's ATK from each enemy it strikes.
- [gcsim v2.47.2 constellation file](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/kaeya/cons.go), MIT: Constellations 1, 2 and 4.
- [Kaeya](https://genshin-impact.fandom.com/wiki/Kaeya), Genshin Impact Wiki: Glacial Heart, the Ascension 4 passive whose particles the kit builds, with its two-use cap and no cooldown. gcsim v2.47.2 implements the same particles, the Cryo drop and the cap of two (`~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/kaeya/skill.go` lines 94 to 114), which the Decisions cite. The v2.47.2 source is on disk at `~/Esposter.noindex/cache/gcsim-v2.47.2/`.
- The cached wiki pages `Ceremonial Bladework` (hit1_1 53.75, poise 27.3), `Frostgnaw` (poise 140) and `Glacial Waltz` (poise 400), in `~/Esposter.noindex/cache/genshin-wiki/Category_Kaeya_Talents.json`.
