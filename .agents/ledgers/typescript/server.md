# Server

`apps/web/server` — routers, procedure builders, guards and services.

| Unit                                                                                            | Swept      | Notes                                   |
| ----------------------------------------------------------------------------------------------- | ---------- | --------------------------------------- |
| `server/trpc/routers/message`, `server/trpc/routers/room`                                       | 2026-09-16 | the widest branch sets in the app       |
| `server/trpc/routers` — the resource family                                                     | 2026-09-07 |                                         |
| `server/trpc/routers` — the rest                                                                | 2026-09-07 |                                         |
| `server/services/message`                                                                       | 2026-09-07 |                                         |
| `server/services/resource`                                                                      | 2026-09-21 | the snapshot and rollback paths         |
| `server/services/room`, `friend`, `user`, `role`, `achievement`                                 | 2026-09-08 | membership and the social graph         |
| `server/services/survey`, `dataset`, `program`                                                  | 2026-09-08 | the response and reporting path         |
| `server/services/blueprint`, `storage`, `blobState`, `notification`, `dashboard`, `emailEditor` | 2026-09-08 |                                         |
| `server/services/auth`, `livekit`, `rateLimiter`, `request`                                     | 2026-09-08 |                                         |
| `server/services/azure`, `pagination`, `db`, `events`, `post`                                   | 2026-09-08 |                                         |
| `server/trpc` — everything outside `routers`                                                    | 2026-09-08 | context, procedure builders, middleware |
| `server/composables`, `server/api`, `server/routes`                                             | 2026-09-15 |                                         |
| `server/models`, `server/db`, `server/plugins`, `server/auth.ts`                                | 2026-09-15 |                                         |
