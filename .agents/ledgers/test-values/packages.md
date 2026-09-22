# Packages

Every workspace package outside `apps/web`. `virrun` holds a fifth of the repo's suites on its own, so it
splits at `services/exec`'s subdirectories.

| Unit                                                                                                | Swept | Notes                                            |
| --------------------------------------------------------------------------------------------------- | ----- | ------------------------------------------------ |
| `virrun` — `services/exec/snapshot`                                                                 | —     |                                                  |
| `virrun` — `services/exec/wsl`                                                                      | —     |                                                  |
| `virrun` — `services/exec/util`                                                                     | —     |                                                  |
| `virrun` — `services/exec/{test,cache,os}`                                                          | —     |                                                  |
| `virrun` — `services/exec` the rest: `vfs`, `bwrap`, `differential`, `store`, `native` and the root | —     |                                                  |
| `virrun` — `services/{cli,configuration,source,virrun}`, `models`, the root                         | —     |                                                  |
| `azure-functions`                                                                                   | —     |                                                  |
| `azure`, `azure-mock`                                                                               | —     |                                                  |
| `db`, `db-schema`, `db-mock`                                                                        | —     |                                                  |
| `shared`, `shared-node`                                                                             | —     |                                                  |
| `parse-tmx`, `xml2js`                                                                               | —     |                                                  |
| `vue-phaserjs`                                                                                      | —     |                                                  |
| `configuration`, `infra`                                                                            | —     |                                                  |
| `keyframe-store`                                                                                    | —     |                                                  |
| `genshin-persona`                                                                                   | —     | keeps its own `TEST_EPOCH_DATE` — see the README |
