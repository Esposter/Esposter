# Varka

Varka's kit is its record and one behaviour module, `createVarkaKitBehaviour`, avatar 10000128 (`~/Esposter.noindex/genshin-dump-backup-6.6/ExcelBinOutput/AvatarExcelConfigData.json`): five normal attacks, a charged attack of two hits (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/varka/charge.go`, line 14), a collision and two plunges, his skill's hit, and the burst's two hits. Every skill and burst hit is Anemo, the burst's by gcsim's default, and his strikes are physical (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/varka/attack.go`, line 72).

Proud skill groups 12832 (his skill) and 12839 (his burst) give their talent multipliers (`~/Esposter.noindex/genshin-dump-backup-6.6/ExcelBinOutput/ProudSkillExcelConfigData.json`); the table reads his cooldowns as 16 and 15 seconds (skills 11282 and 11285 in `~/Esposter.noindex/genshin-dump-backup-6.6/ExcelBinOutput/AvatarSkillExcelConfigData.json`, matching gcsim's `~/Esposter/cache/gcsim-v2.47.2/internal/characters/varka/skill.go`, line 28, and `burst.go`, line 60), his energy cost as 60 (11285's `costElemVal`) and his charged stamina as 50 (group 12831, index 11, which also holds his attacks' multipliers).

gcsim sources: `varka/attack.go`, `charge.go`, `skill.go` and `burst.go`, with the talent names in `config.yml` and the multiplier tables in the generated `zz_varka.dm.go`.

## Decisions

- **The burst's hits are Anemo.** gcsim makes the first hit the element of his conversion, which is Anemo while no Four Winds conversion stands, and the second Anemo. The record holds each as Anemo, the default it gives (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/varka/burst.go`, lines 30 to 32).
- **The skill and burst areas are the circles gcsim gives round his body.** The skill is a circle of 5 metres (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/varka/skill.go`, line 103), and the burst is the circle of 7 metres offset 2 metres ahead, priced at 9 metres as the area holds no offset. Both hits' areas are cited to `~/Esposter/cache/gcsim-v2.47.2/internal/characters/varka/burst.go:51`, the queue call's circle, which its hit's loop iteration reads. The second hit's Wind is cited to `burst.go:30`, the entry its loop reads from `ele` by index. The first hit's Wind is `Unsourced`: gcsim sets `ele[0]` to Anemo only under `if ele[0] == defaultConversionElement` (`burst.go:32`), a runtime comparison the reader does not evaluate, so the default stands.

- **His plunges are borrowed.** gcsim has no plunge file for Varka, so his collision and two plunges take the borrowed plunge of [how a kit is read](../README.md#how-a-kit-is-read), and the roadmap's manual verification has the question.

## Not built

- **Four Winds waits on the conversion hook.** A second press converts his skill into Four Winds (`skill.go`, lines 84-86 and 105-125), and the burst's first hit takes the element it converts to (`burst.go`, lines 30-32). The kit keeps no record of the conversion, so each hit is its Anemo hit alone.
- **His passives wait on their hooks.** Each one reads his Four Winds or the party's Elemental Resonance (`asc.go` and `cons.go`), so none is built.

## Key files

| File                                                             | Role                                                                                                             |
| :--------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/varkaKit.ts` | `createVarkaKitBehaviour`, Varka's module, built on his record and with no behaviour yet                         |
| `packages/genshin-world/src/data/kits/varka.json`                | Varka's overlay: the burst's areas, the second hit's element cited to gcsim, and the first hit's default element |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/varka), MIT: the timings of his strikes, his charged attack, skill, burst and elements, and his table data file.

## Open

- [ ] **The burst's first hit is Anemo** — no source yet: gcsim's conversion check at `~/Esposter/cache/gcsim-v2.47.2/internal/characters/varka/burst.go` line 31 is a runtime comparison the reader does not evaluate, so the default stands.
