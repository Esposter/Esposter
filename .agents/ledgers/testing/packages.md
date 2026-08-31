# Packages

Every workspace package outside `packages/app`. `virrun` holds a fifth of the repo's suites on its own, so it
splits at `services/exec`'s subdirectories.

| Unit                                                                                                | Swept | Notes                                                  |
| --------------------------------------------------------------------------------------------------- | ----- | ------------------------------------------------------ |
| `virrun` — `services/exec/snapshot`                                                                 | —     |                                                        |
| `virrun` — `services/exec/wsl`                                                                      | —     |                                                        |
| `virrun` — `services/exec/util`                                                                     | —     |                                                        |
| `virrun` — `services/exec/{test,cache,os}`                                                          | —     |                                                        |
| `virrun` — `services/exec` the rest: `vfs`, `bwrap`, `differential`, `store`, `native` and the root | —     |                                                        |
| `virrun` — `services/{cli,configuration,source,virrun}`, `models`, the root                         | —     | its two mocked path constants stay — see the README    |
| `azure-functions`                                                                                   | —     | every `mockDb` stays — hoisted factory, see the README |
| `azure`, `azure-mock`                                                                               | —     |                                                        |
| `db`, `db-schema`, `db-mock`                                                                        | —     |                                                        |
| `shared`, `shared-node`                                                                             | —     |                                                        |
| `parse-tmx`, `xml2js`                                                                               | —     |                                                        |
| `vue-phaserjs`                                                                                      | —     |                                                        |
| `configuration`, `infra`                                                                            | —     |                                                        |
