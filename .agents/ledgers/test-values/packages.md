# Packages

Every workspace package outside `apps/web`. `virrun` holds a fifth of the repo's suites on its own, so it
splits at `services/exec`'s subdirectories.

| Unit                                                                                                | Swept      | Notes                                            |
| --------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------ |
| `virrun` — `services/exec/snapshot`                                                                 | 2026-09-22 |                                                  |
| `virrun` — `services/exec/wsl`                                                                      | 2026-09-22 |                                                  |
| `virrun` — `services/exec/util`                                                                     | 2026-09-22 |                                                  |
| `virrun` — `services/exec/{test,cache,os}`                                                          | 2026-09-22 |                                                  |
| `virrun` — `services/exec` the rest: `vfs`, `bwrap`, `differential`, `store`, `native` and the root | 2026-09-22 |                                                  |
| `virrun` — `services/{cli,configuration,source,virrun}`, `models`, the root                         | 2026-09-22 |                                                  |
| `azure-functions`                                                                                   | 2026-09-22 |                                                  |
| `azure`, `azure-mock`                                                                               | 2026-09-22 |                                                  |
| `db`, `db-schema`, `db-mock`                                                                        | 2026-09-22 |                                                  |
| `shared`, `shared-node`                                                                             | 2026-09-22 |                                                  |
| `parse-tmx`, `xml2js`                                                                               | 2026-09-22 |                                                  |
| `vue-phaserjs`                                                                                      | 2026-09-22 |                                                  |
| `configuration`, `infra`                                                                            | 2026-09-22 |                                                  |
| `keyframe-store`                                                                                    | 2026-09-22 |                                                  |
| `genshin-persona`                                                                                   | 2026-09-22 | keeps its own `TEST_EPOCH_DATE` — see the README |
