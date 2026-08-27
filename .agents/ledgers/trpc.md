# tRPC

Router structure, the procedure builder each route picks, ownership guards, and the client path mirroring the file path.

| Unit                                                                                                                      | Swept      | Notes                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server/trpc/procedure`, `guards`, `middleware`, `plugins`, `context.ts`                                                  | 2026-08-27 | `requireUuid` owns the id check three room builders repeated; five bare `BAD_REQUEST`s and four hand-rolled `TRPCError`s onto the guard constructors; six missing return-type generics |
| `server/trpc/routers/message` (+ `moderation`, `emoji`, `scheduledMessageJob`)                                            | 2026-08-27 | seven hand-rolled `TRPCError`s onto the guard constructors, eight missing return-type generics; `scheduledMessageJob` was already clean                                                |
| `server/trpc/routers/room` (+ `directMessage`, `emoji`)                                                                   | —          | member procedures and the invite surface                                                                                                                                               |
| `server/trpc/routers/call`, `role`, `userToRoom`, `webhook`, `searchHistory`                                              | —          | the room-adjacent roots                                                                                                                                                                |
| `server/trpc/routers/resource`, `blueprint`, `note`, `program`, `sheet`, `todoList`                                       | —          | the resource family                                                                                                                                                                    |
| `server/trpc/routers/post`, `like`, `block`, `friend`, `friendRequest`, `user`                                            | —          | the social family                                                                                                                                                                      |
| `server/trpc/routers/dashboard`, `dataset`, `email`, `flowchart`, `webpage`, `survey`                                     | —          | the editor family                                                                                                                                                                      |
| `server/trpc/routers/achievement`, `app`, `clicker`, `dungeons`, `notification`, `pushSubscription`, `session`, `storage` | —          | the remainder; `achievement`'s merge-time exception is deliberate                                                                                                                      |
| `app/plugins` + `app/services/trpc`                                                                                       | —          | the client half: `errorLink`, the proxy, `$trpc` wiring                                                                                                                                |

## Exclusions

- Router **tests** — the `tests` ledger owns those; a finding about a caller pattern goes there.
- Input schemas under `shared/models/db` — `schemas` owns their shape, this ledger only checks the router imports rather than declares them.

## Next enforceable

- The `Function.prototype` key ban (`call`, `apply`, `bind`, `then`, `catch` as router keys) is a fixed word list against an object literal — a custom oxlint plugin decides it, and the failure is otherwise silent.
- Client-path-mirrors-file-path is decidable from the two trees; a test could walk `routers/` and assert the shape rather than a sweep re-reading it.
- Procedure builder choice is a policy question about the route's data, and stays with the sweep.
