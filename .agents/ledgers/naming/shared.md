# Shared

| Unit                                                            | Swept | Notes                                                                                                    |
| --------------------------------------------------------------- | ----- | -------------------------------------------------------------------------------------------------------- |
| `packages/shared`, `packages/shared-node`                       | —     |                                                                                                          |
| `shared/services`, `shared/util`                                | —     |                                                                                                          |
| `shared/models/db/message`                                      | —     | the input schemas every message router imports                                                           |
| `shared/models/db` — `room`, `role`, `moderation`, `webhook`, … | —     | a field mirroring its own column is `packages/db-schema`'s row, not this one                             |
| `shared/models/db` — the rest                                   | —     |                                                                                                          |
| `shared/models/resource/sheet`                                  | —     |                                                                                                          |
| `shared/models/resource` — the rest                             | —     | a type naming what a procedure answers with ends in `Result`                                             |
| `shared/models/dungeons`                                        | —     | the grid-engine `Direction` casing is theirs                                                             |
| `shared/models` — the editor and game trees                     | —     | these mirror ApexCharts field for field, so their spellings are not ours                                 |
| `shared/models` — the rest                                      | —     | `achievement`, `message`, `pagination`, `dataset`, `entity`, `compiler`, `trpc`, `room`, `auth`          |
| `app/components/Styled`                                         | —     | the shell primitives every product renders; `StyledWaypoint`'s `isLoading` is the skill's own named site |
