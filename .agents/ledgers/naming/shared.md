# Shared

`apps/web/shared`, `app/components/Styled` and `packages/shared` — what both halves of the app read.

| Unit                                                                | Swept      | Notes                                                                                                    |
| ------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------- |
| `packages/shared`, `packages/shared-node`                           | 2026-09-14 |                                                                                                          |
| `app/shared/services`, `app/shared/util`                            | 2026-09-11 |                                                                                                          |
| `app/shared/models/db/message`                                      | 2026-09-02 | the input schemas every message router imports                                                           |
| `app/shared/models/db` — `room`, `role`, `moderation`, `webhook`, … | 2026-09-02 | a field mirroring its own column is `packages/db-schema`'s row, not this one                             |
| `app/shared/models/db` — the rest                                   | 2026-09-02 |                                                                                                          |
| `app/shared/models/resource/sheet`                                  | 2026-09-02 |                                                                                                          |
| `app/shared/models/resource` — the rest                             | 2026-09-02 | a type naming what a procedure answers with ends in `Result`                                             |
| `app/shared/models/dungeons`                                        | 2026-09-02 | the grid-engine `Direction` casing is theirs                                                             |
| `app/shared/models` — the editor and game trees                     | 2026-09-02 | these mirror `@vue-flow/core` and ApexCharts field for field, so their spellings are not ours            |
| `app/shared/models` — the rest                                      | 2026-09-03 | `achievement`, `message`, `pagination`, `dataset`, `entity`, `compiler`, `trpc`, `room`, `auth`          |
| `app/components/Styled`                                             | 2026-09-04 | the shell primitives every product renders; `StyledWaypoint`'s `isLoading` is the skill's own named site |
