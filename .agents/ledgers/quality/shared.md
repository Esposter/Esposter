# Shared

| Unit                                                                            | Swept      | Notes                                                                                                  |
| ------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------ |
| optimistic rollbacks                                                            | 2026-08-20 |                                                                                                        |
| `app/components/Styled`                                                         | 2026-08-20 |                                                                                                        |
| `shared/models/db/message` — the roots                                          | —          |                                                                                                        |
| `shared/models/db/message` — `scheduledMessageJob`, `metadata`                  | 2026-09-07 |                                                                                                        |
| `shared/models/db/room`                                                         | 2026-09-07 |                                                                                                        |
| `shared/models/db/roomCategory`, `roomEmoji`, `userToRoom`                      | 2026-09-07 |                                                                                                        |
| `shared/models/db/resource`, `blueprint`, `survey`                              | 2026-09-07 |                                                                                                        |
| `shared/models/db/post`, `moderation`                                           | 2026-09-07 |                                                                                                        |
| `shared/models/db/role`, `call`                                                 | 2026-09-07 |                                                                                                        |
| `shared/models/db` — the identity trees                                         | —          | `user`, `userSettings`, `session`, `webhook`, `searchHistory`, `friend`, `notification`, `achievement` |
| `shared/models/resource` — the roots                                            | —          |                                                                                                        |
| `shared/models/resource` — `survey`, `program`, `blueprint`, `todoList`, `note` | —          |                                                                                                        |
| `shared/models` — the cross-cutting trees                                       | —          | `auth`, `content`, `entity`, `environment`, `file`, `notification`, `room`, `storage`, `trpc`          |
| `shared/services` — the cross-cutting trees                                     | —          | `app`, `intl`, `notification`, `room`, `storage`, `superjson`, `survey`, `trpc`, `zod`                 |
| `shared/util`                                                                   | 2026-09-07 |                                                                                                        |
| `shared/services/dungeons` + `shared/assets`                                    | —          | the definition data both halves read; `shared/generated` is generator output                           |
| `shared/models/dungeons`                                                        | 2026-08-20 |                                                                                                        |
| `shared/models/clicker`                                                         | 2026-09-07 |                                                                                                        |
| `shared/models/achievement` + `services/achievement`                            | 2026-09-07 |                                                                                                        |
| `shared/services/resource`                                                      | 2026-09-07 | nothing to collapse — `ResourceDefinitionMap.title` restating the type is load-bearing                 |
| `shared/models/message` + `services/message`                                    | 2026-09-07 |                                                                                                        |
| `shared/models/dashboard` + `dataset` + `services/dataset`                      | 2026-09-07 |                                                                                                        |
| `shared/models/flowchartEditor`                                                 | 2026-09-07 | a faithful mirror of @vue-flow/core, so its nulls stay                                                 |
| `emailEditor` + `webpageEditor` + `grapesjs`                                    | 2026-09-07 |                                                                                                        |
| `shared/models/pagination` + `services/pagination`                              | 2026-09-07 |                                                                                                        |
| `shared/models/compiler` + `services/compiler`                                  | 2026-09-07 |                                                                                                        |
| the small shared roots                                                          | 2026-09-07 |                                                                                                        |
| `packages/shared` — `src/models`, `src/test`                                    | 2026-09-07 |                                                                                                        |
| `packages/shared` — `src/services`                                              | 2026-09-07 |                                                                                                        |
| `packages/shared` — `src/util/types`                                            | 2026-09-06 | the near-duplicate `DeepOmit` type tests are the `testing` ledger's                                    |
| `packages/shared` — the rest of `src/util`                                      | 2026-09-06 |                                                                                                        |
| `packages/shared-node`                                                          | 2026-09-07 |                                                                                                        |

`shared/models/resource/sheet` belongs to `platform.md`, alongside the `store/resource/sheet` it is read with.
