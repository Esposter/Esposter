# Genshin evidence

One row per spec folder under `openspec/specs/genshin`, derived from the tree by `LedgerUnitsMap`: the folder is the unit, and its `design.md` and `spec.md` are read together.

Find recipe: a folder is open when its design is open, and a design is open when either test holds. A `no source yet` on an unchecked `- [ ]` task line is an open question the task names, and opens nothing.

Test one: a `no source yet` anywhere else in a design.

```bash
git grep -n "no source yet" -- 'openspec/specs/genshin/*/design.md' | grep -vE ':[0-9]+:[[:space:]]*- \[ \] ' | cut -d: -f1 | sort -u
```

Test two: a design with no `## Sources` section and no `genshin-parity/references/` path.

```bash
comm -23 <(git grep -L "^## Sources" -- 'openspec/specs/genshin/*/design.md' | sort) <(git grep -l "genshin-parity/references/" -- 'openspec/specs/genshin/*/design.md' | sort)
```

A pass sweeps the union of both. The spec side has no recipe here: `scripts/src/services/openspec/lintRequirementSources.ts` checks every requirement body, and `readSpecFindings.test.ts` runs it over every spec.

| Unit                                                         | Swept                   | Notes |
| ------------------------------------------------------------ | ----------------------- | ----- |
| `openspec/specs/genshin/achievements`                        | —                       |       |
| `openspec/specs/genshin/adventure-rank`                      | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/adventurer-handbook`                 | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/archive`                             | —                       |       |
| `openspec/specs/genshin/artifact-enhancement`                | —                       |       |
| `openspec/specs/genshin/artifact-strongbox`                  | —                       |       |
| `openspec/specs/genshin/bosses`                              | —                       |       |
| `openspec/specs/genshin/buildings`                           | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/character-attributes`                | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/character-controller`                | —                       |       |
| `openspec/specs/genshin/character-profile`                   | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/character-screen`                    | —                       |       |
| `openspec/specs/genshin/characters/drawing`                  | —                       |       |
| `openspec/specs/genshin/characters/pmx-reader`               | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/characters/published-packs`          | 2026-10-31 · Sonnet 5.5 |       |
| `openspec/specs/genshin/characters/shading`                  | —                       |       |
| `openspec/specs/genshin/chests`                              | —                       |       |
| `openspec/specs/genshin/combat`                              | —                       |       |
| `openspec/specs/genshin/commissions`                         | —                       |       |
| `openspec/specs/genshin/companionship`                       | —                       |       |
| `openspec/specs/genshin/compute/capitals`                    | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/compute/character`                   | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/compute/crafting`                    | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/compute/dialogue`                    | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/compute/fontaine`                    | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/compute/gcg`                         | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/compute/handbook`                    | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/compute/inazuma`                     | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/compute/interaction`                 | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/compute/interface`                   | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/compute/inventory`                   | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/compute/liyue`                       | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/compute/login`                       | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/compute/map`                         | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/compute/mondstadt`                   | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/compute/natlan`                      | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/compute/nod-krai`                    | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/compute/paimon`                      | —                       |       |
| `openspec/specs/genshin/compute/quest`                       | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/compute/settings`                    | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/compute/snezhnaya`                   | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/compute/sumeru`                      | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/compute/text`                        | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/compute/windrise`                    | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/compute/wish`                        | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/compute/world`                       | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/constellations`                      | —                       |       |
| `openspec/specs/genshin/controls`                            | —                       |       |
| `openspec/specs/genshin/cooking`                             | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/crafting`                            | —                       |       |
| `openspec/specs/genshin/derived-assets`                      | —                       |       |
| `openspec/specs/genshin/derived-assets/animestudio-macos`    | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/derived-assets/animestudio-upstream` | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/derived-assets/development-exports`  | —                       |       |
| `openspec/specs/genshin/dev-tools`                           | —                       |       |
| `openspec/specs/genshin/dialogue`                            | —                       |       |
| `openspec/specs/genshin/domains`                             | —                       |       |
| `openspec/specs/genshin/elemental-sight`                     | —                       |       |
| `openspec/specs/genshin/enemies`                             | —                       |       |
| `openspec/specs/genshin/engine-architecture`                 | —                       |       |
| `openspec/specs/genshin/expeditions`                         | —                       |       |
| `openspec/specs/genshin/exploration-progress`                | —                       |       |
| `openspec/specs/genshin/exploring`                           | —                       |       |
| `openspec/specs/genshin/fishing`                             | —                       |       |
| `openspec/specs/genshin/flowing-water`                       | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/follow-camera`                       | —                       |       |
| `openspec/specs/genshin/forging`                             | —                       |       |
| `openspec/specs/genshin/free-camera`                         | —                       |       |
| `openspec/specs/genshin/gadgets`                             | —                       |       |
| `openspec/specs/genshin/game-data-formats`                   | —                       |       |
| `openspec/specs/genshin/game-reading`                        | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/game-text`                           | —                       |       |
| `openspec/specs/genshin/gathering`                           | —                       |       |
| `openspec/specs/genshin/genius-invokation/decks`             | —                       |       |
| `openspec/specs/genshin/genius-invokation/duel-board`        | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/genius-invokation/rules`             | —                       |       |
| `openspec/specs/genshin/ground-paint`                        | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/hosted-game-data`                    | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/hud`                                 | —                       |       |
| `openspec/specs/genshin/imaginarium-theater`                 | —                       |       |
| `openspec/specs/genshin/inazuma`                             | —                       |       |
| `openspec/specs/genshin/interaction`                         | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/interface-layout`                    | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/interface-library`                   | —                       |       |
| `openspec/specs/genshin/inventory`                           | —                       |       |
| `openspec/specs/genshin/investigation`                       | —                       |       |
| `openspec/specs/genshin/kits`                                | —                       |       |
| `openspec/specs/genshin/kits/aino`                           | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/albedo`                         | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/alhaitham`                      | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/aloy`                           | —                       |       |
| `openspec/specs/genshin/kits/alyosha`                        | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/amber`                          | —                       |       |
| `openspec/specs/genshin/kits/arlecchino`                     | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/baizhu`                         | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/barbara`                        | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/beidou`                         | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/bennett`                        | —                       |       |
| `openspec/specs/genshin/kits/candace`                        | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/charlotte`                      | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/chasca`                         | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/chevreuse`                      | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/chiori`                         | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/chongyun`                       | —                       |       |
| `openspec/specs/genshin/kits/citlali`                        | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/clorinde`                       | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/collei`                         | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/columbina`                      | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/cyno`                           | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/dahlia`                         | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/dehya`                          | —                       |       |
| `openspec/specs/genshin/kits/diluc`                          | —                       |       |
| `openspec/specs/genshin/kits/diona`                          | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/dori`                           | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/durin`                          | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/emilie`                         | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/escoffier`                      | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/eula`                           | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/faruzan`                        | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/fischl`                         | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/flins`                          | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/freminet`                       | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/furina`                         | —                       |       |
| `openspec/specs/genshin/kits/gaming`                         | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/ganyu`                          | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/gorou`                          | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/heizou`                         | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/hu-tao`                         | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/iansan`                         | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/ifa`                            | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/illuga`                         | —                       |       |
| `openspec/specs/genshin/kits/ineffa`                         | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/itto`                           | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/jahoda`                         | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/jean`                           | —                       |       |
| `openspec/specs/genshin/kits/kachina`                        | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/kaeya`                          | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/kamisato-ayaka`                 | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/kamisato-ayato`                 | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/kaveh`                          | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/kazuha`                         | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/keqing`                         | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/kinich`                         | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/kirara`                         | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/klee`                           | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/kokomi`                         | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/kujou-sara`                     | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/kuki`                           | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/lan-yan`                        | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/lauma`                          | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/layla`                          | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/linnea`                         | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/lisa`                           | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/lohen`                          | —                       |       |
| `openspec/specs/genshin/kits/lynette`                        | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/lyney`                          | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/mavuika`                        | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/mika`                           | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/mizuki`                         | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/mona`                           | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/mualani`                        | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/nahida`                         | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/navia`                          | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/nefer`                          | —                       |       |
| `openspec/specs/genshin/kits/neuvillette`                    | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/nicole`                         | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/nilou`                          | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/ningguang`                      | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/noelle`                         | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/odette`                         | —                       |       |
| `openspec/specs/genshin/kits/ororon`                         | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/prune`                          | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/qiqi`                           | —                       |       |
| `openspec/specs/genshin/kits/raiden-shogun`                  | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/razor`                          | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/rosaria`                        | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/sandrone`                       | —                       |       |
| `openspec/specs/genshin/kits/sayu`                           | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/sethos`                         | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/shenhe`                         | —                       |       |
| `openspec/specs/genshin/kits/sigewinne`                      | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/skirk`                          | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/sucrose`                        | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/tartaglia`                      | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/thoma`                          | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/tighnari`                       | —                       |       |
| `openspec/specs/genshin/kits/traveler`                       | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/varesa`                         | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/varka`                          | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/venti`                          | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/vesna`                          | —                       |       |
| `openspec/specs/genshin/kits/vodyanitsa`                     | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/wanderer`                       | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/wriothesley`                    | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/xiangling`                      | —                       |       |
| `openspec/specs/genshin/kits/xianyun`                        | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/xiao`                           | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/xilonen`                        | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/xingqiu`                        | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/xinyan`                         | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/yae-miko`                       | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/yanfei`                         | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/yaoyao`                         | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/yelan`                          | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/yoimiya`                        | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/yun-jin`                        | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/kits/zhongli`                        | —                       |       |
| `openspec/specs/genshin/kits/zibai`                          | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/ley-line-outcrops`                   | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/liyue-building-kit`                  | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/load-budget`                         | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/login-screen/camera-and-glide`       | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/login-screen/clouds`                 | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/login-screen/door`                   | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/login-screen/interface`              | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/login-screen/light`                  | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/login-screen/sky`                    | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/login-screen/towers`                 | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/login-screen/walkway`                | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/map`                                 | —                       |       |
| `openspec/specs/genshin/map-unlocking`                       | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/menu-settings`                       | —                       |       |
| `openspec/specs/genshin/menu-time`                           | —                       |       |
| `openspec/specs/genshin/minimap`                             | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/mining-outcrops`                     | —                       |       |
| `openspec/specs/genshin/mondstadt-buildings`                 | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/music/expression`                    | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/music/scoring`                       | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/music/synthesizer`                   | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/music/voices`                        | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/nod-krai-kits`                       | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/offering-systems`                    | —                       |       |
| `openspec/specs/genshin/original-resin`                      | —                       |       |
| `openspec/specs/genshin/paimon-menu`                         | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/parity/clean-plate`                  | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/parity/commands`                     | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/parity/compare`                      | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/parity/costs`                        | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/parity/light`                        | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/parity/motion`                       | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/parity/passes`                       | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/parity/references`                   | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/parity/screens`                      | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/parity/tracing`                      | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/parity/visual-suite`                 | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/parity/witness`                      | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/party`                               | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/puzzles`                             | —                       |       |
| `openspec/specs/genshin/puzzles/monument`                    | —                       |       |
| `openspec/specs/genshin/puzzles/seelie`                      | —                       |       |
| `openspec/specs/genshin/puzzles/time-trial-challenge`        | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/quests`                              | —                       |       |
| `openspec/specs/genshin/region-buildings`                    | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/rendering-style`                     | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/reputation`                          | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/reset-clock`                         | —                       |       |
| `openspec/specs/genshin/resident-schedules`                  | —                       |       |
| `openspec/specs/genshin/sampled-instruments`                 | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/save-data`                           | —                       |       |
| `openspec/specs/genshin/scatter`                             | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/scene-derivation`                    | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/scene-groups`                        | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/screens`                             | —                       |       |
| `openspec/specs/genshin/serenitea-pot`                       | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/session-store`                       | —                       |       |
| `openspec/specs/genshin/shops`                               | —                       |       |
| `openspec/specs/genshin/sky-and-time`                        | —                       |       |
| `openspec/specs/genshin/snezhnaya`                           | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/sound-effects`                       | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/spawned-places`                      | —                       |       |
| `openspec/specs/genshin/spiral-abyss`                        | —                       |       |
| `openspec/specs/genshin/statues-of-the-seven`                | —                       |       |
| `openspec/specs/genshin/sumeru-kits`                         | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/talents`                             | —                       |       |
| `openspec/specs/genshin/terrain`                             | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/terrain-shape-height`                | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/title-splash`                        | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/touch-controls`                      | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/trees`                               | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/vegetation`                          | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/water`                               | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/weapon-enhancement`                  | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/weather`                             | —                       |       |
| `openspec/specs/genshin/wildlife`                            | 2026-10-27 · Haiku 5.5  |       |
| `openspec/specs/genshin/wish`                                | —                       |       |
| `openspec/specs/genshin/world-map`                           | —                       |       |
