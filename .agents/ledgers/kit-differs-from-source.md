# Kit differs from source

Each kit's overlay row (`scripts/src/services/sweeps/ledgerCoverage/LedgerUnitsMap.ts`), and the rule a pass carries is the Framework decisions bullet on `DiffersFromSource` in `openspec/specs/genshin/kits/README.md`.

```bash
grep -n '"DiffersFromSource"' packages/genshin-world/src/data/kits/<kit>.json
grep -n -i 'poise\|cooldown\|gauge\|area\|element' openspec/specs/genshin/kits/<kit>/design.md
```

| Unit                 | Swept                  | Notes              |
| -------------------- | ---------------------- | ------------------ |
| `aino`               | —                      |                    |
| `albedo`             | —                      |                    |
| `alhaitham`          | —                      |                    |
| `aloy`               | —                      |                    |
| `alyosha`            | —                      |                    |
| `amber`              | —                      |                    |
| `arataki-itto`       | —                      |                    |
| `arlecchino`         | —                      |                    |
| `baizhu`             | —                      |                    |
| `barbara`            | —                      |                    |
| `beidou`             | —                      |                    |
| `bennett`            | —                      |                    |
| `candace`            | —                      |                    |
| `charlotte`          | —                      |                    |
| `chasca`             | —                      |                    |
| `chevreuse`          | —                      |                    |
| `chiori`             | —                      |                    |
| `chongyun`           | —                      |                    |
| `citlali`            | 2026-10-19 · Haiku 5.5 |                    |
| `clorinde`           | —                      |                    |
| `collei`             | —                      |                    |
| `columbina`          | —                      |                    |
| `cyno`               | 2026-10-19 · Haiku 5.5 |                    |
| `dahlia`             | —                      |                    |
| `dehya`              | —                      |                    |
| `diluc`              | —                      |                    |
| `diona`              | —                      |                    |
| `dori`               | 2026-10-19 · Haiku 5.5 |                    |
| `durin`              | —                      |                    |
| `emilie`             | —                      |                    |
| `escoffier`          | —                      |                    |
| `eula`               | 2026-10-19 · Haiku 5.5 |                    |
| `faruzan`            | —                      |                    |
| `fischl`             | —                      |                    |
| `flins`              | —                      |                    |
| `freminet`           | —                      |                    |
| `furina`             | —                      |                    |
| `gaming`             | —                      |                    |
| `ganyu`              | —                      |                    |
| `gorou`              | —                      |                    |
| `hu-tao`             | —                      |                    |
| `iansan`             | 2026-10-19 · Haiku 5.5 |                    |
| `ifa`                | —                      |                    |
| `illuga`             | —                      |                    |
| `ineffa`             | —                      |                    |
| `jahoda`             | 2026-10-19 · Haiku 5.5 |                    |
| `jean`               | —                      |                    |
| `kachina`            | —                      |                    |
| `kaedehara-kazuha`   | —                      | design is `kazuha` |
| `kaeya`              | —                      |                    |
| `kamisato-ayaka`     | —                      |                    |
| `kamisato-ayato`     | —                      |                    |
| `kaveh`              | —                      |                    |
| `keqing`             | 2026-10-19 · Haiku 5.5 |                    |
| `kinich`             | —                      |                    |
| `kirara`             | 2026-10-19 · Haiku 5.5 |                    |
| `klee`               | —                      |                    |
| `kujou-sara`         | —                      |                    |
| `kuki-shinobu`       | —                      | design is `kuki`   |
| `lan-yan`            | —                      |                    |
| `lauma`              | —                      |                    |
| `layla`              | —                      |                    |
| `linnea`             | —                      |                    |
| `lisa`               | —                      |                    |
| `lohen`              | —                      |                    |
| `lynette`            | —                      |                    |
| `lyney`              | —                      |                    |
| `mavuika`            | —                      |                    |
| `mika`               | —                      |                    |
| `mona`               | —                      |                    |
| `mualani`            | —                      |                    |
| `nahida`             | —                      |                    |
| `navia`              | —                      |                    |
| `nefer`              | —                      |                    |
| `neuvillette`        | —                      |                    |
| `nicole`             | —                      |                    |
| `nilou`              | —                      |                    |
| `ningguang`          | —                      |                    |
| `noelle`             | —                      |                    |
| `odette`             | —                      |                    |
| `ororon`             | —                      |                    |
| `prune`              | —                      |                    |
| `qiqi`               | —                      |                    |
| `raiden-shogun`      | 2026-10-19 · Haiku 5.5 |                    |
| `razor`              | —                      |                    |
| `rosaria`            | —                      |                    |
| `sandrone`           | —                      |                    |
| `sangonomiya-kokomi` | —                      |                    |
| `sayu`               | 2026-10-19 · Haiku 5.5 |                    |
| `sethos`             | —                      |                    |
| `shenhe`             | —                      |                    |
| `shikanoin-heizou`   | —                      | design is `heizou` |
| `sigewinne`          | —                      |                    |
| `skirk`              | —                      |                    |
| `sucrose`            | —                      |                    |
| `tartaglia`          | —                      |                    |
| `thoma`              | —                      |                    |
| `tighnari`           | —                      |                    |
| `traveler`           | —                      |                    |
| `varesa`             | —                      |                    |
| `varka`              | —                      |                    |
| `venti`              | —                      |                    |
| `vesna`              | —                      |                    |
| `vodyanitsa`         | —                      |                    |
| `wanderer`           | —                      |                    |
| `wriothesley`        | —                      |                    |
| `xiangling`          | —                      |                    |
| `xianyun`            | —                      |                    |
| `xiao`               | —                      |                    |
| `xilonen`            | —                      |                    |
| `xingqiu`            | —                      |                    |
| `xinyan`             | 2026-10-19 · Haiku 5.5 |                    |
| `yae-miko`           | —                      |                    |
| `yanfei`             | —                      |                    |
| `yaoyao`             | —                      |                    |
| `yelan`              | —                      |                    |
| `yoimiya`            | —                      |                    |
| `yumemizuki-mizuki`  | —                      |                    |
| `yun-jin`            | —                      |                    |
| `zhongli`            | —                      |                    |
| `zibai`              | —                      |                    |
