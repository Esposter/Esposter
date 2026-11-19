# Server

| Unit                                                                                            | Swept                  | Notes                                   |
| ----------------------------------------------------------------------------------------------- | ---------------------- | --------------------------------------- |
| `server/trpc/routers/message`, `server/trpc/routers/room`                                       | 2026-10-29 · Haiku 5.5 | the widest branch sets in the app       |
| `server/trpc/routers` — the resource family                                                     | 2026-10-29 · Haiku 5.5 |                                         |
| `server/trpc/routers` — the rest                                                                | 2026-10-29 · Haiku 5.5 |                                         |
| `server/services/message`                                                                       | 2026-10-29 · Haiku 5.5 |                                         |
| `server/services/resource`                                                                      | 2026-10-29 · Haiku 5.5 | the snapshot and rollback paths         |
| `server/services/room`, `friend`, `user`, `role`, `achievement`                                 | —                      | membership and the social graph         |
| `server/services/survey`, `dataset`, `program`                                                  | —                      | the response and reporting path         |
| `server/services/blueprint`, `storage`, `blobState`, `notification`, `dashboard`, `emailEditor` | —                      |                                         |
| `server/services/auth`, `rateLimiter`, `request`                                                | —                      |                                         |
| `db`, `events`, `post`                                                                          | —                      |                                         |
| `server/trpc` — everything outside `routers`                                                    | —                      | context, procedure builders, middleware |
| `server/composables`, `server/api`                                                              | —                      |                                         |
| `server/models`, `server/db`, `server/plugins`, `server/auth.ts`                                | —                      |                                         |
