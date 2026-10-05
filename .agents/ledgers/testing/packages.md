# Packages

Every workspace package outside `apps/web`. `virrun` holds a fifth of the repo's suites on its own, so it
splits at `services/exec`'s subdirectories.

| Unit                                                                                                | Swept                  | Notes                                                  |
| --------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------ |
| `virrun` — `services/exec/snapshot`                                                                 | 2026-10-05 · Opus 5.5  |                                                        |
| `virrun` — `services/exec/wsl`                                                                      | 2026-10-05 · Opus 5.5  |                                                        |
| `virrun` — `services/exec/{util,spawn}`                                                             | 2026-10-05 · Opus 5.5  |                                                        |
| `virrun` — `services/exec/{test,cache,os}`                                                          | 2026-10-05 · Opus 5.5  |                                                        |
| `virrun` — `services/exec` the rest: `vfs`, `bwrap`, `differential`, `store`, `native` and the root | 2026-09-27 · Opus 5.5  |                                                        |
| `virrun` — `services/{cli,configuration,source,virrun}`, `models`, the root                         | 2026-09-27 · Opus 5.5  | its two mocked path constants stay — see the README    |
| `azure-functions`                                                                                   | 2026-09-27 · Opus 5.5  | every `mockDb` stays — hoisted factory, see the README |
| `azure`, `azure-mock`                                                                               | 2026-09-25 · Opus 5.5  |                                                        |
| `db`, `db-schema`, `db-mock`                                                                        | 2026-09-27 · Opus 5.5  |                                                        |
| `shared`, `shared-node`                                                                             | 2026-09-27 · Opus 5.5  |                                                        |
| `parse-tmx`, `xml2js`                                                                               | 2026-09-25 · Opus 5.5  |                                                        |
| `vue-phaserjs`                                                                                      | 2026-10-05 · Opus 5.5  |                                                        |
| `configuration`, `infra`                                                                            | 2026-09-27 · Opus 5.5  |                                                        |
| `keyframe-store`                                                                                    | 2026-10-05 · Opus 5.5  |                                                        |
| `agent-console-server`                                                                              | 2026-09-27 · Opus 5.5  |                                                        |
| `genshin-persona`                                                                                   | 2026-10-04 · Fable 5.1 | its mocks are hoisted factories, typed off the source  |
| `genshin-engine`                                                                                    | 2026-10-05 · Opus 5.5  |                                                        |
| `genshin-world`                                                                                     | 2026-10-05 · Opus 5.5  |                                                        |
| `genshin-interface`                                                                                 | 2026-10-05 · Opus 5.5  |                                                        |
| `genshin-text`                                                                                      | 2026-10-05 · Opus 5.5  |                                                        |
| `genshin-mods`                                                                                      | 2026-10-04 · Fable 5.1 |                                                        |
| `pitch-transcription`                                                                               | 2026-10-05 · Opus 5.5  |                                                        |
| `trpc-msw`                                                                                          | 2026-10-05 · Opus 5.5  |                                                        |
| `trpc-nuxt-module`                                                                                  | 2026-10-05 · Opus 5.5  |                                                        |
| `follow-ups`                                                                                        | 2026-10-04 · Fable 5.1 |                                                        |
