# tRPC

Router structure, the procedure builder each route picks, ownership guards, and the client path mirroring the file path.

| Unit                                                                                                                      | Notes                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `server/trpc/procedure`                                                                                                   |                                                                                               |
| `server/trpc/guards`, `middleware`, `plugins`, `context.ts`                                                               | the guard constructors live here, so this row is exempt from the hand-rolled-error rule below |
| `server/trpc/routers/message` (+ `moderation`, `emoji`, `scheduledMessageJob`)                                            |                                                                                               |
| `server/trpc/routers/room` (+ `category`, `createDirectMessageWithFriend`, `directMessage`, `emoji`, `filter`)            | a guard reached from here is verified rather than assumed — the walk leaves the router tree   |
| `server/trpc/routers/room/index`                                                                                          |                                                                                               |
| `server/trpc/routers/invite`                                                                                              | a link's usability is `checkIsInviteUsable`'s alone, never a second copy in SQL               |
| `server/trpc/routers/call`, `role`, `userToRoom`, `webhook`, `searchHistory`                                              | the call routers key on a session rather than a room, so the room builders do not reach them  |
| `server/trpc/routers/resource`, `blueprint`, `note`                                                                       | three routers are `createResourceProcedures` alone                                            |
| `server/trpc/routers/program`, `sheet`, `todoList`                                                                        |                                                                                               |
| `server/trpc/routers/post`, `like`, `block`, `friend`, `friendRequest`                                                    | no room to gate on — every write scopes to the caller                                         |
| `server/trpc/routers/user`                                                                                                | no room to gate on — every write scopes to the caller                                         |
| `server/trpc/routers/dashboard`, `dataset`, `email`, `webpage`, `survey`                                                  | survey's participant routes are rate-limited by design and its owner routes are not           |
| `server/trpc/routers/achievement`, `app`, `clicker`, `dungeons`, `notification`, `pushSubscription`, `session`, `storage` | the two game saves are the shared blob-state builders                                         |
| `app/plugins` + `app/services/trpc`                                                                                       | the client half — `errorLink` and the alerted-code set it answers from                        |

## Exclusions

- Router **tests** — the `testing` ledger owns those; a finding about a caller pattern goes there.
- Input schemas under `shared/models/db` — `schemas` owns their shape, this ledger only checks the router imports rather than declares them.
