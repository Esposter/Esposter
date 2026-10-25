# Server

`apps/web/server` — every router, procedure builder, guard and service.

| Unit                                                                                                                                 | Swept                  | Notes                         |
| ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- | ----------------------------- |
| `trpc/routers/message` — `emoji`, `index`, `moderation`, `scheduledMessageJob`                                                       | 2026-10-25 · Haiku 5.5 | the widest suite in the tree  |
| `trpc/routers/room` — `category`, `createDirectMessageWithFriend`, `directMessage`, `emoji`, `filter`, `index`                       | 2026-10-25 · Haiku 5.5 |                               |
| `trpc/routers` — `call`, `role`, `searchHistory`, `userToRoom`, `webhook`                                                            | —                      | the caller fixtures live here |
| `trpc/routers` — `resource`, `blueprint`, `note`, `program`, `sheet`, `todoList`, `survey`                                           | 2026-10-25 · Haiku 5.5 |                               |
| `trpc/routers` — `dashboard`, `dataset`, `email`, `flowchart`, `webpage`, `post`, `like`, `block`, `friend`, `friendRequest`, `user` | 2026-10-25 · Haiku 5.5 |                               |
| `trpc/routers` — `achievement`, `app`, `clicker`, `dungeons`, `notification`, `pushSubscription`, `session`, `storage`               | 2026-10-25 · Haiku 5.5 |                               |
| `trpc/routers` — `bookmark`, the root suites and the shared fixtures                                                                 | —                      |                               |
| `trpc/{guards,procedure,plugins,middleware}` and `context.test.ts`                                                                   | —                      |                               |
| `services/pagination`, `services/{resource,blueprint}`                                                                               | —                      |                               |
| `services` — the rest, `composables`, `api`, `routes`                                                                                | —                      |                               |
