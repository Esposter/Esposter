# Packages

Every workspace package outside `apps/web`. `virrun` holds a fifth of the repo's suites on its own, so it
splits at `services/exec`'s subdirectories.

| Unit                                                                                                | Swept                 | Notes                                            |
| --------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------ |
| `virrun` — `services/exec/snapshot`                                                                 | 2026-09-25 · Opus 5.5 |                                                  |
| `virrun` — `services/exec/wsl`                                                                      | 2026-09-24 · Opus 5.5 |                                                  |
| `virrun` — `services/exec/util`                                                                     | 2026-09-25 · Opus 5.5 |                                                  |
| `virrun` — `services/exec/{test,cache,os}`                                                          | 2026-09-25 · Opus 5.5 |                                                  |
| `virrun` — `services/exec` the rest: `vfs`, `bwrap`, `differential`, `store`, `native` and the root | 2026-09-25 · Opus 5.5 |                                                  |
| `virrun` — `services/{cli,configuration,source,virrun}`, `models`, the root                         | 2026-09-25 · Opus 5.5 |                                                  |
| `azure-functions`                                                                                   | 2026-09-25 · Opus 5.5 |                                                  |
| `azure`, `azure-mock`                                                                               | 2026-09-25 · Opus 5.5 |                                                  |
| `db`, `db-schema`, `db-mock`                                                                        | 2026-09-25 · Opus 5.5 |                                                  |
| `shared`, `shared-node`                                                                             | 2026-09-25 · Opus 5.5 |                                                  |
| `parse-tmx`, `xml2js`                                                                               | 2026-09-24 · Opus 5.5 |                                                  |
| `vue-phaserjs`                                                                                      | 2026-09-25 · Opus 5.5 |                                                  |
| `configuration`, `infra`                                                                            | 2026-09-25 · Opus 5.5 |                                                  |
| `keyframe-store`                                                                                    | 2026-09-25 · Opus 5.5 |                                                  |
| `genshin-persona`                                                                                   | 2026-09-22 · Opus 5   | keeps its own `TEST_EPOCH_DATE` — see the README |
