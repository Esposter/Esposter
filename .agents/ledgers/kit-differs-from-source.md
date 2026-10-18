# Kit differs from source

Each kit's overlay row (`scripts/src/services/sweeps/ledgerCoverage/LedgerUnitsMap.ts`), and the rule a pass carries is the Framework decisions bullet on `DiffersFromSource` in `openspec/specs/genshin/kits/README.md`.

```bash
grep -n '"DiffersFromSource"' packages/genshin-world/src/data/kits/<kit>.json
grep -n -i 'poise\|cooldown\|gauge\|area\|element' openspec/specs/genshin/kits/<kit>/design.md
```

Reopened 2026-10-19: the convention covers table and wiki candidates as well as gcsim, so a kit with an open table or wiki
`DiffersFromSource` entry is open until a pass reviews those entries. Each reopened row is marked `reopened` in Notes, and its
date is cleared by a `Reopens:` trailer. The gcsim-era passes that dated these kits predate the wider convention, so the coverage
tool would otherwise re-date them. A pass that reviews a kit's open entries closes it with its own `Ledger:` trailer.

| Unit                 | Swept                  | Notes                        |
| -------------------- | ---------------------- | ---------------------------- |
| `aino`               | —                      | reopened                     |
| `albedo`             | —                      |                              |
| `alhaitham`          | —                      |                              |
| `aloy`               | —                      | reopened                     |
| `alyosha`            | —                      |                              |
| `amber`              | —                      |                              |
| `arataki-itto`       | —                      | reopened                     |
| `arlecchino`         | —                      |                              |
| `baizhu`             | —                      |                              |
| `barbara`            | —                      |                              |
| `beidou`             | —                      |                              |
| `bennett`            | —                      |                              |
| `candace`            | —                      |                              |
| `charlotte`          | —                      |                              |
| `chasca`             | —                      |                              |
| `chevreuse`          | —                      |                              |
| `chiori`             | —                      | reopened                     |
| `chongyun`           | —                      |                              |
| `citlali`            | —                      | reopened                     |
| `clorinde`           | —                      | reopened                     |
| `collei`             | —                      |                              |
| `columbina`          | —                      | reopened                     |
| `cyno`               | —                      | reopened                     |
| `dahlia`             | —                      | reopened                     |
| `dehya`              | —                      | reopened                     |
| `diluc`              | —                      |                              |
| `diona`              | —                      | reopened                     |
| `dori`               | —                      | reopened                     |
| `durin`              | —                      |                              |
| `emilie`             | —                      | reopened                     |
| `escoffier`          | —                      | reopened                     |
| `eula`               | —                      | reopened                     |
| `faruzan`            | —                      |                              |
| `fischl`             | —                      |                              |
| `flins`              | —                      |                              |
| `freminet`           | —                      | reopened                     |
| `furina`             | —                      |                              |
| `gaming`             | —                      | reopened                     |
| `ganyu`              | —                      | reopened                     |
| `gorou`              | —                      |                              |
| `hu-tao`             | —                      |                              |
| `iansan`             | 2026-10-19 · Haiku 5.5 |                              |
| `ifa`                | —                      |                              |
| `illuga`             | —                      |                              |
| `ineffa`             | —                      | reopened                     |
| `jahoda`             | —                      | reopened                     |
| `jean`               | —                      |                              |
| `kachina`            | —                      |                              |
| `kaedehara-kazuha`   | —                      | design is `kazuha`; reopened |
| `kaeya`              | —                      |                              |
| `kamisato-ayaka`     | —                      |                              |
| `kamisato-ayato`     | —                      |                              |
| `kaveh`              | —                      | reopened                     |
| `keqing`             | 2026-10-19 · Haiku 5.5 |                              |
| `kinich`             | —                      |                              |
| `kirara`             | —                      | reopened                     |
| `klee`               | —                      |                              |
| `kujou-sara`         | —                      |                              |
| `kuki-shinobu`       | —                      | design is `kuki`; reopened   |
| `lan-yan`            | —                      |                              |
| `lauma`              | —                      | reopened                     |
| `layla`              | —                      |                              |
| `linnea`             | —                      |                              |
| `lisa`               | —                      |                              |
| `lohen`              | —                      |                              |
| `lynette`            | —                      |                              |
| `lyney`              | —                      |                              |
| `mavuika`            | —                      | reopened                     |
| `mika`               | —                      | reopened                     |
| `mona`               | —                      |                              |
| `mualani`            | —                      |                              |
| `nahida`             | —                      | reopened                     |
| `navia`              | —                      |                              |
| `nefer`              | —                      |                              |
| `neuvillette`        | —                      |                              |
| `nicole`             | —                      |                              |
| `nilou`              | —                      |                              |
| `ningguang`          | —                      |                              |
| `noelle`             | —                      |                              |
| `odette`             | —                      |                              |
| `ororon`             | —                      | reopened                     |
| `prune`              | —                      |                              |
| `qiqi`               | —                      |                              |
| `raiden-shogun`      | —                      | reopened                     |
| `razor`              | —                      |                              |
| `rosaria`            | —                      |                              |
| `sandrone`           | —                      |                              |
| `sangonomiya-kokomi` | —                      |                              |
| `sayu`               | —                      | reopened                     |
| `sethos`             | —                      | reopened                     |
| `shenhe`             | —                      |                              |
| `shikanoin-heizou`   | —                      | design is `heizou`; reopened |
| `sigewinne`          | —                      | reopened                     |
| `skirk`              | —                      |                              |
| `sucrose`            | —                      |                              |
| `tartaglia`          | —                      |                              |
| `thoma`              | —                      | reopened                     |
| `tighnari`           | —                      | reopened                     |
| `traveler`           | —                      |                              |
| `varesa`             | —                      | reopened                     |
| `varka`              | —                      |                              |
| `venti`              | —                      |                              |
| `vesna`              | —                      |                              |
| `vodyanitsa`         | —                      |                              |
| `wanderer`           | —                      | reopened                     |
| `wriothesley`        | —                      | reopened                     |
| `xiangling`          | —                      |                              |
| `xianyun`            | —                      | reopened                     |
| `xiao`               | —                      |                              |
| `xilonen`            | —                      | reopened                     |
| `xingqiu`            | —                      |                              |
| `xinyan`             | —                      | reopened                     |
| `yae-miko`           | —                      |                              |
| `yanfei`             | —                      |                              |
| `yaoyao`             | —                      | reopened                     |
| `yelan`              | —                      | reopened                     |
| `yoimiya`            | —                      | reopened                     |
| `yumemizuki-mizuki`  | —                      | reopened                     |
| `yun-jin`            | —                      |                              |
| `zhongli`            | —                      |                              |
| `zibai`              | —                      |                              |
