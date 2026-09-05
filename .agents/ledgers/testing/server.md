# Server

`packages/app/server` — every router, procedure builder, guard and service.

| Unit                                                                                                                                 | Swept      | Notes                         |
| ------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ----------------------------- |
| `trpc/routers/message` — `emoji`, `index`, `moderation`, `scheduledMessageJob`                                                       | 2026-09-05 | the widest suite in the tree  |
| `trpc/routers/room` — `category`, `createDirectMessageWithFriend`, `directMessage`, `emoji`, `filter`, `index`                       | 2026-09-05 |                               |
| `trpc/routers` — `call`, `role`, `searchHistory`, `userToRoom`, `webhook`                                                            | 2026-09-05 | the caller fixtures live here |
| `trpc/routers` — `resource`, `blueprint`, `note`, `program`, `sheet`, `todoList`, `survey`                                           | 2026-09-05 |                               |
| `trpc/routers` — `dashboard`, `dataset`, `email`, `flowchart`, `webpage`, `post`, `like`, `block`, `friend`, `friendRequest`, `user` | —          |                               |
| `trpc/routers` — `achievement`, `app`, `clicker`, `dungeons`, `notification`, `pushSubscription`, `session`, `storage`               | —          |                               |
| `trpc/{guards,procedure,plugins,middleware}` and `context.test.ts`                                                                   | —          |                               |
| `services/pagination`, `services/{resource,blueprint}`                                                                               | 2026-09-05 |                               |
| `services` — the rest, `composables`, `api`, `routes`                                                                                | —          |                               |
