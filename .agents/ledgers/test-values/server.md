# Server

`apps/web/server` — every router, procedure builder, guard and service.

| Unit                                                                                                                                 | Swept                 | Notes                         |
| ------------------------------------------------------------------------------------------------------------------------------------ | --------------------- | ----------------------------- |
| `trpc/routers/message` — `emoji`, `index`, `moderation`, `scheduledMessageJob`                                                       | 2026-09-25 · Opus 5.5 | the widest suite in the tree  |
| `trpc/routers/room` — `category`, `createDirectMessageWithFriend`, `directMessage`, `emoji`, `filter`, `index`                       | 2026-09-25 · Opus 5.5 |                               |
| `trpc/routers` — `call`, `role`, `searchHistory`, `userToRoom`, `webhook`                                                            | 2026-09-24 · Opus 5.5 | the caller fixtures live here |
| `trpc/routers` — `resource`, `blueprint`, `note`, `program`, `sheet`, `todoList`, `survey`                                           | 2026-09-24 · Opus 5.5 |                               |
| `trpc/routers` — `dashboard`, `dataset`, `email`, `flowchart`, `webpage`, `post`, `like`, `block`, `friend`, `friendRequest`, `user` | 2026-09-24 · Opus 5.5 |                               |
| `trpc/routers` — `achievement`, `app`, `clicker`, `dungeons`, `notification`, `pushSubscription`, `session`, `storage`               | 2026-09-24 · Opus 5.5 |                               |
| `trpc/{guards,procedure,plugins,middleware}` and `context.test.ts`                                                                   | 2026-09-24 · Opus 5.5 |                               |
| `services/pagination`, `services/{resource,blueprint}`                                                                               | 2026-09-24 · Opus 5.5 |                               |
| `services` — the rest, `composables`, `api`, `routes`                                                                                | 2026-09-24 · Opus 5.5 |                               |
