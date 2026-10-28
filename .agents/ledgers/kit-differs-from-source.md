# Kit differs from source

Each kit's overlay row (`scripts/src/services/sweeps/ledgerCoverage/LedgerUnitsMap.ts`), and the rule a pass carries is the Framework decisions bullet on `DiffersFromSource` in `openspec/specs/genshin/kits/README.md`.

```bash
grep -n '"DiffersFromSource"' packages/genshin-world/src/data/kits/<kit>.json
grep -n -i 'poise\|cooldown\|gauge\|area\|element' openspec/specs/genshin/kits/<kit>/design.md
```

| Unit                 | Swept                  | Notes              |
| -------------------- | ---------------------- | ------------------ |
| `aino`               | 2026-10-19 · Haiku 5.5 |                    |
| `albedo`             | 2026-10-19 · Haiku 5.5 |                    |
| `alhaitham`          | 2026-10-19 · Haiku 5.5 |                    |
| `aloy`               | 2026-10-19 · Haiku 5.5 |                    |
| `alyosha`            | 2026-10-19 · Haiku 5.5 |                    |
| `amber`              | 2026-10-19 · Haiku 5.5 |                    |
| `arataki-itto`       | 2026-10-19 · Haiku 5.5 | design is `itto`   |
| `arlecchino`         | 2026-10-19 · Haiku 5.5 |                    |
| `baizhu`             | 2026-10-19 · Haiku 5.5 |                    |
| `barbara`            | 2026-10-19 · Haiku 5.5 |                    |
| `beidou`             | 2026-10-19 · Haiku 5.5 |                    |
| `bennett`            | 2026-10-19 · Haiku 5.5 |                    |
| `candace`            | 2026-10-19 · Haiku 5.5 |                    |
| `charlotte`          | 2026-10-19 · Haiku 5.5 |                    |
| `chasca`             | 2026-10-19 · Haiku 5.5 |                    |
| `chevreuse`          | 2026-10-19 · Haiku 5.5 |                    |
| `chiori`             | 2026-10-19 · Haiku 5.5 |                    |
| `chongyun`           | 2026-10-19 · Haiku 5.5 |                    |
| `citlali`            | —                      |                    |
| `clorinde`           | 2026-10-19 · Haiku 5.5 |                    |
| `collei`             | 2026-10-19 · Haiku 5.5 |                    |
| `columbina`          | 2026-10-19 · Haiku 5.5 |                    |
| `cyno`               | 2026-10-19 · Haiku 5.5 |                    |
| `dahlia`             | 2026-10-19 · Haiku 5.5 |                    |
| `dehya`              | 2026-10-19 · Haiku 5.5 |                    |
| `diluc`              | 2026-10-19 · Haiku 5.5 |                    |
| `diona`              | 2026-10-19 · Haiku 5.5 |                    |
| `dori`               | —                      |                    |
| `durin`              | 2026-10-19 · Haiku 5.5 |                    |
| `emilie`             | 2026-10-19 · Haiku 5.5 |                    |
| `escoffier`          | 2026-10-19 · Haiku 5.5 |                    |
| `eula`               | 2026-10-19 · Haiku 5.5 |                    |
| `faruzan`            | 2026-10-19 · Haiku 5.5 |                    |
| `fischl`             | 2026-10-19 · Haiku 5.5 |                    |
| `flins`              | 2026-10-19 · Haiku 5.5 |                    |
| `freminet`           | 2026-10-19 · Haiku 5.5 |                    |
| `furina`             | 2026-10-19 · Haiku 5.5 |                    |
| `gaming`             | —                      |                    |
| `ganyu`              | 2026-10-19 · Haiku 5.5 |                    |
| `gorou`              | 2026-10-19 · Haiku 5.5 |                    |
| `hu-tao`             | 2026-10-19 · Haiku 5.5 |                    |
| `iansan`             | 2026-10-19 · Haiku 5.5 |                    |
| `ifa`                | 2026-10-19 · Haiku 5.5 |                    |
| `illuga`             | 2026-10-19 · Haiku 5.5 |                    |
| `ineffa`             | 2026-10-19 · Haiku 5.5 |                    |
| `jahoda`             | 2026-10-19 · Haiku 5.5 |                    |
| `jean`               | 2026-10-19 · Haiku 5.5 |                    |
| `kachina`            | 2026-10-19 · Haiku 5.5 |                    |
| `kaedehara-kazuha`   | —                      | design is `kazuha` |
| `kaeya`              | 2026-10-19 · Haiku 5.5 |                    |
| `kamisato-ayaka`     | 2026-10-19 · Haiku 5.5 |                    |
| `kamisato-ayato`     | 2026-10-19 · Haiku 5.5 |                    |
| `kaveh`              | 2026-10-19 · Haiku 5.5 |                    |
| `keqing`             | 2026-10-19 · Haiku 5.5 |                    |
| `kinich`             | 2026-10-19 · Haiku 5.5 |                    |
| `kirara`             | 2026-10-19 · Haiku 5.5 |                    |
| `klee`               | 2026-10-19 · Haiku 5.5 |                    |
| `kujou-sara`         | 2026-10-19 · Haiku 5.5 |                    |
| `kuki-shinobu`       | 2026-10-19 · Haiku 5.5 | design is `kuki`   |
| `lan-yan`            | 2026-10-19 · Haiku 5.5 |                    |
| `lauma`              | 2026-10-19 · Haiku 5.5 |                    |
| `layla`              | 2026-10-19 · Haiku 5.5 |                    |
| `linnea`             | 2026-10-19 · Haiku 5.5 |                    |
| `lisa`               | 2026-10-19 · Haiku 5.5 |                    |
| `lohen`              | 2026-10-19 · Haiku 5.5 |                    |
| `lynette`            | 2026-10-19 · Haiku 5.5 |                    |
| `lyney`              | 2026-10-19 · Haiku 5.5 |                    |
| `mavuika`            | 2026-10-19 · Haiku 5.5 |                    |
| `mika`               | 2026-10-19 · Opus 5.5  |                    |
| `mona`               | 2026-10-19 · Haiku 5.5 |                    |
| `mualani`            | 2026-10-19 · Haiku 5.5 |                    |
| `nahida`             | 2026-10-19 · Haiku 5.5 |                    |
| `navia`              | 2026-10-19 · Haiku 5.5 |                    |
| `nefer`              | 2026-10-19 · Haiku 5.5 |                    |
| `neuvillette`        | 2026-10-19 · Haiku 5.5 |                    |
| `nicole`             | 2026-10-19 · Haiku 5.5 |                    |
| `nilou`              | 2026-10-19 · Haiku 5.5 |                    |
| `ningguang`          | 2026-10-19 · Haiku 5.5 |                    |
| `noelle`             | 2026-10-19 · Haiku 5.5 |                    |
| `odette`             | 2026-10-19 · Haiku 5.5 |                    |
| `ororon`             | —                      |                    |
| `prune`              | 2026-10-19 · Haiku 5.5 |                    |
| `qiqi`               | 2026-10-19 · Haiku 5.5 |                    |
| `raiden-shogun`      | 2026-10-19 · Haiku 5.5 |                    |
| `razor`              | 2026-10-19 · Haiku 5.5 |                    |
| `rosaria`            | 2026-10-19 · Haiku 5.5 |                    |
| `sandrone`           | 2026-10-19 · Haiku 5.5 |                    |
| `sangonomiya-kokomi` | 2026-10-19 · Haiku 5.5 | design is `kokomi` |
| `sayu`               | —                      |                    |
| `sethos`             | 2026-10-19 · Haiku 5.5 |                    |
| `shenhe`             | 2026-10-19 · Haiku 5.5 |                    |
| `shikanoin-heizou`   | 2026-10-29 · Haiku 5.5 | design is `heizou` |
| `sigewinne`          | 2026-10-29 · Haiku 5.5 |                    |
| `skirk`              | 2026-10-19 · Haiku 5.5 |                    |
| `sucrose`            | 2026-10-19 · Haiku 5.5 |                    |
| `tartaglia`          | 2026-10-19 · Haiku 5.5 |                    |
| `thoma`              | 2026-10-19 · Haiku 5.5 |                    |
| `tighnari`           | 2026-10-19 · Haiku 5.5 |                    |
| `traveler`           | 2026-10-19 · Haiku 5.5 |                    |
| `varesa`             | 2026-10-19 · Haiku 5.5 |                    |
| `varka`              | 2026-10-19 · Haiku 5.5 |                    |
| `venti`              | 2026-10-19 · Haiku 5.5 |                    |
| `vesna`              | 2026-10-19 · Haiku 5.5 |                    |
| `vodyanitsa`         | 2026-10-19 · Haiku 5.5 |                    |
| `wanderer`           | 2026-10-29 · Haiku 5.5 |                    |
| `wriothesley`        | 2026-10-26 · Haiku 5.5 |                    |
| `xiangling`          | 2026-10-19 · Haiku 5.5 |                    |
| `xianyun`            | 2026-10-19 · Haiku 5.5 |                    |
| `xiao`               | 2026-10-19 · Haiku 5.5 |                    |
| `xilonen`            | 2026-10-19 · Haiku 5.5 |                    |
| `xingqiu`            | 2026-10-19 · Haiku 5.5 |                    |
| `xinyan`             | 2026-10-29 · Haiku 5.5 |                    |
| `yae-miko`           | 2026-10-19 · Haiku 5.5 |                    |
| `yanfei`             | 2026-10-19 · Haiku 5.5 |                    |
| `yaoyao`             | 2026-10-29 · Haiku 5.5 |                    |
| `yelan`              | 2026-10-19 · Opus 5.5  |                    |
| `yoimiya`            | 2026-10-29 · Haiku 5.5 |                    |
| `yumemizuki-mizuki`  | 2026-10-19 · Haiku 5.5 | design is `mizuki` |
| `yun-jin`            | 2026-10-19 · Haiku 5.5 |                    |
| `zhongli`            | 2026-10-19 · Haiku 5.5 |                    |
| `zibai`              | 2026-10-19 · Haiku 5.5 |                    |
