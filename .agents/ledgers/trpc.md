# tRPC

Router structure, the procedure builder each route picks, ownership guards, and the client path mirroring the file path.

| Unit                                                                                                                      | Swept      | Notes                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server/trpc/procedure`, `guards`, `middleware`, `plugins`, `context.ts`                                                  | 2026-08-27 | `requireUuid` owns the id check three room builders repeated; five bare `BAD_REQUEST`s and four hand-rolled `TRPCError`s onto the guard constructors; six missing return-type generics                                                                    |
| `server/trpc/routers/message` (+ `moderation`, `emoji`, `scheduledMessageJob`)                                            | 2026-08-27 | seven hand-rolled `TRPCError`s onto the guard constructors, eight missing return-type generics; `scheduledMessageJob` was already clean                                                                                                                   |
| `server/trpc/routers/room` (+ `directMessage`, `emoji`, `category`, `filter`)                                             | 2026-08-27 | guards verified rather than assumed — `deleteRoom` scopes through `ownedBy`, `readRoom` through an exists subquery, `leaveRoom` decides ownership inside. That walk found ten hand-rolled `TRPCError`s in `server/services`, outside the rule's old scope |
| `server/trpc/routers/call`, `role`, `userToRoom`, `webhook`, `searchHistory`                                              | 2026-08-31 | one single-room read hand-rolled the membership check the builder does; the call routers key on a session rather than a room, so the builder does not reach them                                                                                          |
| `server/trpc/routers/resource`, `blueprint`, `note`, `program`, `sheet`, `todoList`                                       | 2026-08-31 | clean — three routers are `createResourceProcedures` alone, and every bulk write scopes ownership in its where clause and says so                                                                                                                         |
| `server/trpc/routers/post`, `like`, `block`, `friend`, `friendRequest`, `user`                                            | 2026-08-31 | clean — no room to gate on, so every write scopes to the caller through `ownedBy` or its own userId predicate                                                                                                                                             |
| `server/trpc/routers/dashboard`, `dataset`, `email`, `flowchart`, `webpage`, `survey`                                     | 2026-08-31 | clean — four are `createResourceProcedures` alone; survey's participant routes are rate-limited by design, owner routes are not                                                                                                                           |
| `server/trpc/routers/achievement`, `app`, `clicker`, `dungeons`, `notification`, `pushSubscription`, `session`, `storage` | —          | generics enforced across it, so a pass here reads for builder choice, guards and structure only                                                                                                                                                           |
| `app/plugins` + `app/services/trpc`                                                                                       | 2026-08-30 | `errorLink` listed its three alerted codes twice — the set `checkIsAlertedByErrorLink` answers from, and a switch beside it — so a caller could be told the link owns a code the link declined to alert                                                   |

## Exclusions

- Router **tests** — the `testing` ledger owns those; a finding about a caller pattern goes there.
- Input schemas under `shared/models/db` — `schemas` owns their shape, this ledger only checks the router imports rather than declares them.

## Next enforceable

**Both decidable halves now belong to `scripts/oxlint/trpcProcedure.ts`**, found by hand in two consecutive units
before being handed over:

- `trpc-procedure/no-hand-rolled-error` — **on across `packages/app/server/**`**, since rows 1-2 cleared the tree. It
  Reports a `new TRPCError` whose `message` reads `.message` off an error class a guard constructor already
  Wraps, and a `BAD_REQUEST` carrying no message at all. `guards/*.ts` is exempt: those files are the
  Constructors. A bare `UNAUTHORIZED` is not reported — `errorLink.ts` states the authorization guards throw it.
- `trpc-procedure/require-return-type` — **now on across `server/trpc/**`**. It reports a `.query`/`.mutation`
  With no type argument. `.subscription` is out of scope: an async generator carries its yield type as a callback
  Annotation. It landed as a ratchet: on for swept paths only, then widened to the whole tree once the 37 sites
  It found were cleared. Reuse that order. A rule switched on over unswept territory buys disables, not
  Coverage, and the disables outlive whoever added them.

Still with the sweep, because no rule can decide them: procedure builder choice is a policy question about the
Route's data, and client-path-mirrors-file-path would be a test walking both trees rather than a lint rule.
