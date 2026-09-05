# Packages

Every workspace package outside `packages/app`. `virrun` holds a fifth of the repo's suites on its own, so it
splits at `services/exec`'s subdirectories.

| Unit                                                                                                | Swept      | Notes                                                  |
| --------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------ |
| `virrun` — `services/exec/snapshot`                                                                 | —          |                                                        |
| `virrun` — `services/exec/wsl`                                                                      | —          |                                                        |
| `virrun` — `services/exec/util`                                                                     | 2026-09-05 |                                                        |
| `virrun` — `services/exec/{test,cache,os}`                                                          | 2026-09-05 |                                                        |
| `virrun` — `services/exec` the rest: `vfs`, `bwrap`, `differential`, `store`, `native` and the root | —          |                                                        |
| `virrun` — `services/{cli,configuration,source,virrun}`, `models`, the root                         | —          | its two mocked path constants stay — see the README    |
| `azure-functions`                                                                                   | 2026-09-05 | every `mockDb` stays — hoisted factory, see the README |
| `azure`, `azure-mock`                                                                               | 2026-09-05 |                                                        |
| `db`, `db-schema`, `db-mock`                                                                        | 2026-09-05 |                                                        |
| `shared`, `shared-node`                                                                             | 2026-09-05 |                                                        |
| `parse-tmx`, `xml2js`                                                                               | 2026-09-05 |                                                        |
| `vue-phaserjs`                                                                                      | 2026-09-05 |                                                        |
| `configuration`, `infra`                                                                            | 2026-09-05 |                                                        |
