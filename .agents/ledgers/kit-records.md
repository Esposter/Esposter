# Kit records

Each kit's overlay derives its row (`scripts/src/services/sweeps/ledgerCoverage/LedgerUnitsMap.ts`), and the rule a pass carries is the Framework decisions bullet on `Unsourced` and `Unclassified` in `openspec/specs/genshin/kits/README.md`.

```bash
grep -c '"Unclassified"' packages/genshin-world/src/data/kits/<kit>.json
grep -n 'gcsim/\(tree\|blob\)/main' openspec/specs/genshin/kits/<kit>/design.md
```

| Unit                 | Swept                  | Notes                                                                    |
| -------------------- | ---------------------- | ------------------------------------------------------------------------ |
| `aino`               | 2026-10-14 · Haiku 5.5 |                                                                          |
| `albedo`             | 2026-10-19 · Haiku 5.5 |                                                                          |
| `alhaitham`          | 2026-10-14 · Haiku 5.5 |                                                                          |
| `aloy`               | 2026-10-14 · Haiku 5.5 |                                                                          |
| `alyosha`            | —                      |                                                                          |
| `amber`              | 2026-10-19 · Haiku 5.5 |                                                                          |
| `arataki-itto`       | 2026-10-19 · Haiku 5.5 | design is `itto`                                                         |
| `arlecchino`         | 2026-10-14 · Haiku 5.5 |                                                                          |
| `baizhu`             | 2026-10-19 · Haiku 5.5 |                                                                          |
| `barbara`            | 2026-10-19 · Haiku 5.5 |                                                                          |
| `beidou`             | 2026-10-19 · Haiku 5.5 |                                                                          |
| `bennett`            | 2026-10-19 · Haiku 5.5 |                                                                          |
| `candace`            | —                      |                                                                          |
| `charlotte`          | —                      |                                                                          |
| `chasca`             | 2026-10-19 · Haiku 5.5 |                                                                          |
| `chevreuse`          | 2026-10-14 · Haiku 5.5 |                                                                          |
| `chiori`             | 2026-10-14 · Haiku 5.5 |                                                                          |
| `chongyun`           | —                      |                                                                          |
| `citlali`            | 2026-10-14 · Haiku 5.5 |                                                                          |
| `clorinde`           | 2026-10-14 · Haiku 5.5 |                                                                          |
| `collei`             | 2026-10-14 · Haiku 5.5 |                                                                          |
| `columbina`          | 2026-10-19 · Haiku 5.5 | her page's poise bullet names the deleted framework proposal's poise gap |
| `cyno`               | —                      |                                                                          |
| `dahlia`             | 2026-10-14 · Haiku 5.5 |                                                                          |
| `dehya`              | 2026-10-19 · Haiku 5.5 |                                                                          |
| `diluc`              | 2026-10-19 · Haiku 5.5 |                                                                          |
| `diona`              | 2026-10-19 · Haiku 5.5 |                                                                          |
| `dori`               | 2026-10-19 · Haiku 5.5 |                                                                          |
| `durin`              | —                      |                                                                          |
| `emilie`             | 2026-10-14 · Haiku 5.5 |                                                                          |
| `escoffier`          | 2026-10-19 · Haiku 5.5 |                                                                          |
| `eula`               | 2026-10-14 · Haiku 5.5 |                                                                          |
| `faruzan`            | 2026-10-19 · Haiku 5.5 |                                                                          |
| `fischl`             | —                      |                                                                          |
| `flins`              | —                      |                                                                          |
| `freminet`           | 2026-10-19 · Haiku 5.5 |                                                                          |
| `furina`             | —                      |                                                                          |
| `gaming`             | 2026-10-14 · Haiku 5.5 |                                                                          |
| `ganyu`              | 2026-10-19 · Haiku 5.5 |                                                                          |
| `gorou`              | 2026-10-13 · Haiku 5.5 |                                                                          |
| `hu-tao`             | —                      |                                                                          |
| `iansan`             | 2026-10-14 · Haiku 5.5 |                                                                          |
| `ifa`                | 2026-10-14 · Haiku 5.5 |                                                                          |
| `illuga`             | 2026-10-19 · Haiku 5.5 |                                                                          |
| `ineffa`             | 2026-10-19 · Haiku 5.5 |                                                                          |
| `jahoda`             | 2026-10-19 · Haiku 5.5 |                                                                          |
| `jean`               | 2026-10-19 · Haiku 5.5 |                                                                          |
| `kachina`            | —                      |                                                                          |
| `kaedehara-kazuha`   | —                      | design is `kazuha`                                                       |
| `kaeya`              | —                      |                                                                          |
| `kamisato-ayaka`     | —                      |                                                                          |
| `kamisato-ayato`     | —                      |                                                                          |
| `kaveh`              | 2026-10-14 · Haiku 5.5 |                                                                          |
| `keqing`             | 2026-10-19 · Haiku 5.5 |                                                                          |
| `kinich`             | —                      |                                                                          |
| `kirara`             | 2026-10-19 · Haiku 5.5 |                                                                          |
| `klee`               | —                      |                                                                          |
| `kujou-sara`         | 2026-10-19 · Haiku 5.5 |                                                                          |
| `kuki-shinobu`       | —                      | design is `kuki`                                                         |
| `lan-yan`            | 2026-10-14 · Haiku 5.5 |                                                                          |
| `lauma`              | 2026-10-19 · Haiku 5.5 |                                                                          |
| `layla`              | —                      |                                                                          |
| `linnea`             | —                      |                                                                          |
| `lisa`               | 2026-10-19 · Haiku 5.5 |                                                                          |
| `lohen`              | —                      |                                                                          |
| `lynette`            | 2026-10-14 · Haiku 5.5 |                                                                          |
| `lyney`              | 2026-10-19 · Haiku 5.5 |                                                                          |
| `mavuika`            | 2026-10-14 · Haiku 5.5 |                                                                          |
| `mika`               | 2026-10-14 · Haiku 5.5 |                                                                          |
| `mona`               | —                      |                                                                          |
| `mualani`            | 2026-10-14 · Haiku 5.5 |                                                                          |
| `nahida`             | 2026-10-19 · Haiku 5.5 |                                                                          |
| `navia`              | 2026-10-14 · Haiku 5.5 |                                                                          |
| `nefer`              | 2026-10-19 · Haiku 5.5 |                                                                          |
| `neuvillette`        | 2026-10-19 · Haiku 5.5 |                                                                          |
| `nicole`             | 2026-10-14 · Haiku 5.5 |                                                                          |
| `nilou`              | 2026-10-14 · Haiku 5.5 |                                                                          |
| `ningguang`          | 2026-10-19 · Haiku 5.5 |                                                                          |
| `noelle`             | 2026-10-19 · Haiku 5.5 |                                                                          |
| `odette`             | 2026-10-19 · Haiku 5.5 |                                                                          |
| `ororon`             | —                      |                                                                          |
| `prune`              | 2026-10-14 · Haiku 5.5 |                                                                          |
| `qiqi`               | —                      |                                                                          |
| `raiden-shogun`      | 2026-10-19 · Haiku 5.5 |                                                                          |
| `razor`              | 2026-10-18 · Haiku 5.5 |                                                                          |
| `rosaria`            | 2026-10-19 · Haiku 5.5 |                                                                          |
| `sandrone`           | —                      |                                                                          |
| `sangonomiya-kokomi` | 2026-10-19 · Haiku 5.5 | design is `kokomi`                                                       |
| `sayu`               | 2026-10-19 · Haiku 5.5 |                                                                          |
| `sethos`             | 2026-10-14 · Haiku 5.5 |                                                                          |
| `shenhe`             | 2026-10-14 · Haiku 5.5 |                                                                          |
| `shikanoin-heizou`   | 2026-10-19 · Haiku 5.5 | design is `heizou`                                                       |
| `sigewinne`          | 2026-10-19 · Haiku 5.5 |                                                                          |
| `skirk`              | 2026-10-19 · Haiku 5.5 |                                                                          |
| `sucrose`            | —                      |                                                                          |
| `tartaglia`          | 2026-10-19 · Haiku 5.5 |                                                                          |
| `thoma`              | 2026-10-14 · Haiku 5.5 |                                                                          |
| `tighnari`           | 2026-10-19 · Haiku 5.5 |                                                                          |
| `traveler`           | —                      |                                                                          |
| `varesa`             | 2026-10-19 · Haiku 5.5 |                                                                          |
| `varka`              | 2026-10-14 · Haiku 5.5 |                                                                          |
| `venti`              | 2026-10-19 · Haiku 5.5 |                                                                          |
| `vesna`              | 2026-10-19 · Haiku 5.5 |                                                                          |
| `vodyanitsa`         | —                      |                                                                          |
| `wanderer`           | 2026-10-19 · Haiku 5.5 |                                                                          |
| `wriothesley`        | —                      |                                                                          |
| `xiangling`          | 2026-10-19 · Haiku 5.5 |                                                                          |
| `xianyun`            | 2026-10-19 · Haiku 5.5 |                                                                          |
| `xiao`               | —                      |                                                                          |
| `xilonen`            | 2026-10-14 · Haiku 5.5 |                                                                          |
| `xingqiu`            | —                      |                                                                          |
| `xinyan`             | 2026-10-19 · Haiku 5.5 |                                                                          |
| `yae-miko`           | —                      |                                                                          |
| `yanfei`             | —                      |                                                                          |
| `yaoyao`             | 2026-10-14 · Haiku 5.5 |                                                                          |
| `yelan`              | 2026-10-19 · Haiku 5.5 |                                                                          |
| `yoimiya`            | —                      |                                                                          |
| `yumemizuki-mizuki`  | 2026-10-14 · Haiku 5.5 | design is `mizuki`                                                       |
| `yun-jin`            | 2026-10-19 · Haiku 5.5 |                                                                          |
| `zhongli`            | —                      |                                                                          |
| `zibai`              | 2026-10-19 · Haiku 5.5 |                                                                          |
