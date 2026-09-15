# Shared

`apps/web/shared`, `app/components/Styled` and `packages/shared` — what both halves of the app read.

| Unit                                                            | Swept      | Notes                                                                                                    |
| --------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------- |
| `packages/shared`, `packages/shared-node`                       | 2026-09-14 |                                                                                                          |
| `shared/services`, `shared/util`                                | 2026-09-11 |                                                                                                          |
| `shared/models/db/message`                                      | 2026-09-02 | the input schemas every message router imports                                                           |
| `shared/models/db` — `room`, `role`, `moderation`, `webhook`, … | 2026-09-15 | a field mirroring its own column is `packages/db-schema`'s row, not this one                             |
| `shared/models/db` — the rest                                   | 2026-09-02 |                                                                                                          |
| `shared/models/resource/sheet`                                  | 2026-09-02 |                                                                                                          |
| `shared/models/resource` — the rest                             | 2026-09-02 | a type naming what a procedure answers with ends in `Result`                                             |
| `shared/models/dungeons`                                        | 2026-09-02 | the grid-engine `Direction` casing is theirs                                                             |
| `shared/models` — the editor and game trees                     | 2026-09-02 | these mirror `@vue-flow/core` and ApexCharts field for field, so their spellings are not ours            |
| `shared/models` — the rest                                      | 2026-09-03 | `achievement`, `message`, `pagination`, `dataset`, `entity`, `compiler`, `trpc`, `room`, `auth`          |
| `app/components/Styled`                                         | 2026-09-04 | the shell primitives every product renders; `StyledWaypoint`'s `isLoading` is the skill's own named site |
