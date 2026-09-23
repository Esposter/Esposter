# Server

`apps/web/server` — routers, procedure builders, guards and services.

| Unit                                                                                                                                        | Swept               | Notes                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ---------------------------------------------------------------------------- |
| `server/trpc/routers` — `message`, `room`, `userToRoom`, `role`, `call`, `webhook`, `searchHistory`                                         | 2026-09-22 · Opus 5 | procedure and result naming; the `trpc` skill owns the pattern               |
| `server/trpc/routers` — `resource`, `blueprint`, `note`, `program`, `sheet`, `todoList`, `survey`                                           | 2026-09-22 · Opus 5 | an error constructor is `get*Error`, matching the guards                     |
| `server/trpc/routers` — `dashboard`, `dataset`, `email`, `flowchart`, `webpage`, `post`, `like`, `block`, `friend`, `friendRequest`, `user` | 2026-09-22 · Opus 5 |                                                                              |
| `server/trpc/routers` — `achievement`, `app`, `clicker`, `dungeons`, `notification`, `pushSubscription`, `session`, `storage`               | 2026-09-22 · Opus 5 | a caller-scoped read is `readMy*`, never `readOwn*`                          |
| `server/trpc/{guards,procedure,plugins,middleware}`, `context.ts`                                                                           | 2026-09-22 · Opus 5 | a guard that throws is `assert*`; `is*` is a stored boolean and nothing else |
| `server/composables`, `server/api`, `server/routes`                                                                                         | 2026-09-22 · Opus 5 | `get*` vs `read*` on the server side                                         |
| `server/services/message`                                                                                                                   | 2026-09-22 · Opus 5 | a product's own casing carries into a local — `liveKit`, never `livekit`     |
| `server/services/resource`                                                                                                                  | 2026-09-22 · Opus 5 |                                                                              |
| `server/services` — `room`, `role`, `user`, `friend`, `post`                                                                                | 2026-09-22 · Opus 5 |                                                                              |
| `server/services` — `blueprint`, `program`, `survey`, `dataset`, `dashboard`, `emailEditor`                                                 | 2026-09-22 · Opus 5 | a constant map or set stays PascalCase; a scalar is `SCREAMING_SNAKE`        |
| `server/services` — `azure`, `storage`, `livekit`, `notification`, `events`, `request`                                                      | 2026-09-22 · Opus 5 |                                                                              |
| `server/services` — `auth`, `rateLimiter`, `achievement`, `pagination`, `db`, `blobState`                                                   | 2026-09-22 · Opus 5 |                                                                              |
