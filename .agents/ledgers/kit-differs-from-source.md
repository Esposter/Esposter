# Kit differs from source

One row per character's kit overlay (`scripts/src/services/sweeps/ledgerCoverage/LedgerUnitsMap.ts`). Each row reads the overlay's entries against the Framework decisions bullets on `Unsourced`, `Unclassified` and `DiffersFromSource` in `openspec/specs/genshin/kits/README.md`, which is the rule a pass carries.

A kit's design is `openspec/specs/genshin/kits/<folder>/design.md`. The folder is the kit's own name or, where the kit is named differently, the one word of its name a folder bears (`arataki-itto` is `itto`, `kuki-shinobu` is `kuki`). No overlay names its design, so the name is the link, and `pnpm ai:sweep:kit-design` resolves every kit to exactly one folder.

```bash
kit=arataki-itto; d=openspec/specs/genshin/kits; pnpm ai:sweep:kit-design $kit
grep -n '"DiffersFromSource"' packages/genshin-world/src/data/kits/$kit.json
grep -n -i 'poise\|cooldown\|gauge\|area\|element' $d/<folder>/design.md
```

`scripts/src/workspace/ledgerUnits.test.ts` fails a dated row whose overlay still holds an `Unclassified` entry.

| Unit                 | Swept                   | Notes                                                                    |
| -------------------- | ----------------------- | ------------------------------------------------------------------------ |
| `aino`               | 2026-10-19 · Haiku 5.5  |                                                                          |
| `albedo`             | 2026-10-19 · Haiku 5.5  |                                                                          |
| `alhaitham`          | 2026-10-19 · Haiku 5.5  |                                                                          |
| `aloy`               | 2026-10-19 · Haiku 5.5  |                                                                          |
| `alyosha`            | 2026-10-19 · Haiku 5.5  |                                                                          |
| `amber`              | 2026-10-19 · Haiku 5.5  |                                                                          |
| `arataki-itto`       | 2026-10-19 · Haiku 5.5  |                                                                          |
| `arlecchino`         | 2026-10-19 · Haiku 5.5  |                                                                          |
| `baizhu`             | 2026-10-19 · Haiku 5.5  |                                                                          |
| `barbara`            | 2026-10-19 · Haiku 5.5  |                                                                          |
| `beidou`             | 2026-10-19 · Haiku 5.5  |                                                                          |
| `bennett`            | 2026-10-19 · Haiku 5.5  |                                                                          |
| `candace`            | 2026-10-19 · Haiku 5.5  |                                                                          |
| `charlotte`          | 2026-10-19 · Haiku 5.5  |                                                                          |
| `chasca`             | 2026-10-19 · Haiku 5.5  |                                                                          |
| `chevreuse`          | 2026-10-19 · Haiku 5.5  |                                                                          |
| `chiori`             | 2026-10-19 · Haiku 5.5  |                                                                          |
| `chongyun`           | 2026-10-19 · Haiku 5.5  |                                                                          |
| `citlali`            | 2026-11-01 · Haiku 5.5  |                                                                          |
| `clorinde`           | 2026-10-19 · Haiku 5.5  |                                                                          |
| `collei`             | 2026-10-19 · Haiku 5.5  |                                                                          |
| `columbina`          | 2026-10-19 · Haiku 5.5  | her page's poise bullet names the deleted framework proposal's poise gap |
| `cyno`               | 2026-10-19 · Haiku 5.5  |                                                                          |
| `dahlia`             | 2026-10-19 · Haiku 5.5  |                                                                          |
| `dehya`              | 2026-10-19 · Haiku 5.5  |                                                                          |
| `diluc`              | 2026-10-19 · Haiku 5.5  |                                                                          |
| `diona`              | 2026-10-19 · Haiku 5.5  |                                                                          |
| `dori`               | 2026-11-01 · Haiku 5.5  |                                                                          |
| `durin`              | 2026-10-19 · Haiku 5.5  |                                                                          |
| `emilie`             | 2026-10-19 · Haiku 5.5  |                                                                          |
| `escoffier`          | 2026-10-19 · Haiku 5.5  |                                                                          |
| `eula`               | 2026-10-19 · Haiku 5.5  |                                                                          |
| `faruzan`            | 2026-10-19 · Haiku 5.5  |                                                                          |
| `fischl`             | 2026-10-19 · Haiku 5.5  |                                                                          |
| `flins`              | 2026-10-19 · Haiku 5.5  |                                                                          |
| `freminet`           | 2026-10-19 · Haiku 5.5  |                                                                          |
| `furina`             | 2026-10-19 · Haiku 5.5  |                                                                          |
| `gaming`             | 2026-11-01 · Haiku 5.5  |                                                                          |
| `ganyu`              | 2026-10-19 · Haiku 5.5  |                                                                          |
| `gorou`              | 2026-10-19 · Haiku 5.5  |                                                                          |
| `hu-tao`             | 2026-10-19 · Haiku 5.5  |                                                                          |
| `iansan`             | 2026-10-19 · Haiku 5.5  |                                                                          |
| `ifa`                | 2026-10-19 · Haiku 5.5  |                                                                          |
| `illuga`             | 2026-10-19 · Haiku 5.5  |                                                                          |
| `ineffa`             | 2026-10-19 · Haiku 5.5  |                                                                          |
| `jahoda`             | 2026-10-19 · Haiku 5.5  |                                                                          |
| `jean`               | 2026-10-19 · Haiku 5.5  |                                                                          |
| `kachina`            | 2026-10-19 · Haiku 5.5  |                                                                          |
| `kaedehara-kazuha`   | 2026-11-01 · Haiku 5.5  |                                                                          |
| `kaeya`              | 2026-10-19 · Haiku 5.5  |                                                                          |
| `kamisato-ayaka`     | 2026-10-19 · Haiku 5.5  |                                                                          |
| `kamisato-ayato`     | 2026-10-19 · Haiku 5.5  |                                                                          |
| `kaveh`              | 2026-10-19 · Haiku 5.5  |                                                                          |
| `keqing`             | 2026-10-19 · Haiku 5.5  |                                                                          |
| `kinich`             | 2026-10-19 · Haiku 5.5  |                                                                          |
| `kirara`             | 2026-10-19 · Haiku 5.5  |                                                                          |
| `klee`               | 2026-10-19 · Haiku 5.5  |                                                                          |
| `kujou-sara`         | 2026-10-19 · Haiku 5.5  |                                                                          |
| `kuki-shinobu`       | 2026-10-19 · Haiku 5.5  |                                                                          |
| `lan-yan`            | 2026-10-19 · Haiku 5.5  |                                                                          |
| `lauma`              | 2026-10-19 · Haiku 5.5  |                                                                          |
| `layla`              | 2026-10-19 · Haiku 5.5  |                                                                          |
| `linnea`             | 2026-10-19 · Haiku 5.5  |                                                                          |
| `lisa`               | 2026-10-19 · Haiku 5.5  | discharge hitmarks, hold multipliers: roadmap's gcsim reader items       |
| `lohen`              | 2026-10-19 · Haiku 5.5  |                                                                          |
| `lynette`            | 2026-10-19 · Haiku 5.5  |                                                                          |
| `lyney`              | 2026-10-19 · Haiku 5.5  |                                                                          |
| `mavuika`            | 2026-10-19 · Haiku 5.5  |                                                                          |
| `mika`               | 2026-10-19 · Opus 5.5   |                                                                          |
| `mona`               | 2026-10-19 · Haiku 5.5  |                                                                          |
| `mualani`            | 2026-10-19 · Haiku 5.5  |                                                                          |
| `nahida`             | 2026-10-19 · Haiku 5.5  |                                                                          |
| `navia`              | 2026-10-19 · Haiku 5.5  |                                                                          |
| `nefer`              | 2026-10-19 · Haiku 5.5  |                                                                          |
| `neuvillette`        | 2026-10-19 · Haiku 5.5  |                                                                          |
| `nicole`             | 2026-10-19 · Haiku 5.5  |                                                                          |
| `nilou`              | 2026-10-19 · Haiku 5.5  |                                                                          |
| `ningguang`          | 2026-10-19 · Haiku 5.5  |                                                                          |
| `noelle`             | 2026-10-19 · Haiku 5.5  |                                                                          |
| `odette`             | 2026-10-19 · Haiku 5.5  |                                                                          |
| `ororon`             | 2026-11-01 · Haiku 5.5  |                                                                          |
| `prune`              | 2026-10-19 · Haiku 5.5  |                                                                          |
| `qiqi`               | 2026-10-19 · Haiku 5.5  |                                                                          |
| `raiden-shogun`      | 2026-10-19 · Haiku 5.5  |                                                                          |
| `razor`              | 2026-10-19 · Haiku 5.5  |                                                                          |
| `rosaria`            | 2026-10-19 · Haiku 5.5  |                                                                          |
| `sandrone`           | 2026-10-19 · Haiku 5.5  |                                                                          |
| `sangonomiya-kokomi` | 2026-10-19 · Haiku 5.5  |                                                                          |
| `sayu`               | 2026-11-01 · Sonnet 5.5 |                                                                          |
| `sethos`             | 2026-10-19 · Haiku 5.5  |                                                                          |
| `shenhe`             | 2026-10-19 · Haiku 5.5  |                                                                          |
| `shikanoin-heizou`   | 2026-10-29 · Haiku 5.5  |                                                                          |
| `sigewinne`          | 2026-10-29 · Haiku 5.5  |                                                                          |
| `skirk`              | 2026-10-19 · Haiku 5.5  |                                                                          |
| `sucrose`            | 2026-10-19 · Haiku 5.5  |                                                                          |
| `tartaglia`          | 2026-10-19 · Haiku 5.5  | Melee Stance burst radius: roadmap's unread-shapes item                  |
| `thoma`              | 2026-10-19 · Haiku 5.5  |                                                                          |
| `tighnari`           | 2026-10-19 · Haiku 5.5  |                                                                          |
| `traveler`           | 2026-10-19 · Haiku 5.5  |                                                                          |
| `varesa`             | 2026-10-19 · Haiku 5.5  |                                                                          |
| `varka`              | 2026-10-19 · Haiku 5.5  |                                                                          |
| `venti`              | 2026-10-19 · Haiku 5.5  |                                                                          |
| `vesna`              | 2026-10-19 · Haiku 5.5  |                                                                          |
| `vodyanitsa`         | 2026-10-19 · Haiku 5.5  |                                                                          |
| `wanderer`           | 2026-10-29 · Haiku 5.5  |                                                                          |
| `wriothesley`        | 2026-10-26 · Haiku 5.5  |                                                                          |
| `xiangling`          | 2026-10-19 · Haiku 5.5  |                                                                          |
| `xianyun`            | 2026-10-19 · Haiku 5.5  |                                                                          |
| `xiao`               | 2026-10-19 · Haiku 5.5  |                                                                          |
| `xilonen`            | 2026-10-19 · Haiku 5.5  |                                                                          |
| `xingqiu`            | 2026-10-19 · Haiku 5.5  |                                                                          |
| `xinyan`             | 2026-10-29 · Haiku 5.5  |                                                                          |
| `yae-miko`           | 2026-10-19 · Haiku 5.5  |                                                                          |
| `yanfei`             | 2026-10-19 · Haiku 5.5  |                                                                          |
| `yaoyao`             | 2026-10-29 · Haiku 5.5  |                                                                          |
| `yelan`              | 2026-10-19 · Opus 5.5   |                                                                          |
| `yoimiya`            | 2026-10-29 · Haiku 5.5  |                                                                          |
| `yumemizuki-mizuki`  | 2026-10-19 · Haiku 5.5  |                                                                          |
| `yun-jin`            | 2026-10-19 · Haiku 5.5  |                                                                          |
| `zhongli`            | 2026-10-19 · Haiku 5.5  |                                                                          |
| `zibai`              | 2026-10-19 · Haiku 5.5  |                                                                          |
