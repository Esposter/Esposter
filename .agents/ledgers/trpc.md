# tRPC

Router structure, the procedure builder each route picks, ownership guards, and the client path mirroring the file path.

| Unit                                                                                                                      | Swept      | Notes                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------- |
| `server/trpc/procedure`, `guards`, `middleware`, `plugins`, `context.ts`                                                  | 2026-08-27 | the guard constructors live here, so this row is exempt from the hand-rolled-error rule below |
| `server/trpc/routers/message` (+ `moderation`, `emoji`, `scheduledMessageJob`)                                            | 2026-08-27 |                                                                                               |
| `server/trpc/routers/room` (+ `directMessage`, `emoji`, `category`, `filter`)                                             | 2026-08-27 | a guard reached from here is verified rather than assumed — the walk leaves the router tree   |
| `server/trpc/routers/call`, `role`, `userToRoom`, `webhook`, `searchHistory`                                              | 2026-08-31 | the call routers key on a session rather than a room, so the room builders do not reach them  |
| `server/trpc/routers/resource`, `blueprint`, `note`, `program`, `sheet`, `todoList`                                       | 2026-08-31 | three routers are `createResourceProcedures` alone                                            |
| `server/trpc/routers/post`, `like`, `block`, `friend`, `friendRequest`, `user`                                            | 2026-08-31 | no room to gate on — every write scopes to the caller                                         |
| `server/trpc/routers/dashboard`, `dataset`, `email`, `flowchart`, `webpage`, `survey`                                     | 2026-08-31 | survey's participant routes are rate-limited by design and its owner routes are not           |
| `server/trpc/routers/achievement`, `app`, `clicker`, `dungeons`, `notification`, `pushSubscription`, `session`, `storage` | 2026-08-31 | the two game saves are the shared blob-state builders                                         |
| `app/plugins` + `app/services/trpc`                                                                                       | 2026-08-30 | the client half — `errorLink` and the alerted-code set it answers from                        |

## Exclusions

- Router **tests** — the `testing` ledger owns those; a finding about a caller pattern goes there.
- Input schemas under `shared/models/db` — `schemas` owns their shape, this ledger only checks the router imports rather than declares them.

## Next enforceable

Both decidable halves belong to `scripts/oxlint/trpcProcedure.ts` — `trpc-procedure/no-hand-rolled-error` across
`packages/app/server/**` and `trpc-procedure/require-return-type` across `server/trpc/**`. What is left cannot be
decided by a rule: procedure builder choice is a policy question about the route's data, and
client-path-mirrors-file-path would be a test walking both trees.
