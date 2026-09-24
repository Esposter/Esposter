# Shared

`apps/web/shared`, `app/components/Styled` and `packages/shared` — what both halves of the app read.

| Unit                                                            | Swept                 | Notes                                                                                                    |
| --------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------- |
| `packages/shared`, `packages/shared-node`                       | 2026-09-22 · Opus 5   |                                                                                                          |
| `shared/services`, `shared/util`                                | 2026-09-24 · Opus 5.5 |                                                                                                          |
| `shared/models/db/message`                                      | 2026-09-24 · Opus 5.5 | the input schemas every message router imports                                                           |
| `shared/models/db` — `room`, `role`, `moderation`, `webhook`, … | 2026-09-24 · Opus 5.5 | a field mirroring its own column is `packages/db-schema`'s row, not this one                             |
| `shared/models/db` — the rest                                   | 2026-09-24 · Opus 5.5 |                                                                                                          |
| `shared/models/resource/sheet`                                  | 2026-09-24 · Opus 5.5 |                                                                                                          |
| `shared/models/resource` — the rest                             | 2026-09-24 · Opus 5.5 | a type naming what a procedure answers with ends in `Result`                                             |
| `shared/models/dungeons`                                        | 2026-09-24 · Opus 5.5 | the grid-engine `Direction` casing is theirs                                                             |
| `shared/models` — the editor and game trees                     | 2026-09-24 · Opus 5.5 | these mirror `@vue-flow/core` and ApexCharts field for field, so their spellings are not ours            |
| `shared/models` — the rest                                      | 2026-09-24 · Opus 5.5 | `achievement`, `message`, `pagination`, `dataset`, `entity`, `compiler`, `trpc`, `room`, `auth`          |
| `app/components/Styled`                                         | 2026-09-22 · Opus 5   | the shell primitives every product renders; `StyledWaypoint`'s `isLoading` is the skill's own named site |
