# tRPC

Router structure, the procedure builder each route picks, ownership guards, and the client path mirroring the file path.

| Unit                                                                                                                      | Swept      | Notes                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server/trpc/procedure`, `guards`, `middleware`, `plugins`, `context.ts`                                                  | 2026-08-27 | `requireUuid` owns the id check three room builders repeated; five bare `BAD_REQUEST`s and four hand-rolled `TRPCError`s onto the guard constructors; six missing return-type generics |
| `server/trpc/routers/message` (+ `moderation`, `emoji`, `scheduledMessageJob`)                                            | 2026-08-27 | seven hand-rolled `TRPCError`s onto the guard constructors, eight missing return-type generics; `scheduledMessageJob` was already clean                                                |
| `server/trpc/routers/room` (+ `directMessage`, `emoji`)                                                                   | —          | generics enforced across it, so a pass here reads for builder choice, guards and structure only                                                                                        |
| `server/trpc/routers/call`, `role`, `userToRoom`, `webhook`, `searchHistory`                                              | —          | generics enforced across it, so a pass here reads for builder choice, guards and structure only                                                                                        |
| `server/trpc/routers/resource`, `blueprint`, `note`, `program`, `sheet`, `todoList`                                       | —          | generics enforced across it, so a pass here reads for builder choice, guards and structure only                                                                                        |
| `server/trpc/routers/post`, `like`, `block`, `friend`, `friendRequest`, `user`                                            | —          | generics enforced across it, so a pass here reads for builder choice, guards and structure only                                                                                        |
| `server/trpc/routers/dashboard`, `dataset`, `email`, `flowchart`, `webpage`, `survey`                                     | —          | generics enforced across it, so a pass here reads for builder choice, guards and structure only                                                                                        |
| `server/trpc/routers/achievement`, `app`, `clicker`, `dungeons`, `notification`, `pushSubscription`, `session`, `storage` | —          | generics enforced across it, so a pass here reads for builder choice, guards and structure only                                                                                        |
| `app/plugins` + `app/services/trpc`                                                                                       | —          | the client half: `errorLink`, the proxy, `$trpc` wiring                                                                                                                                |

## Exclusions

- Router **tests** — the `tests` ledger owns those; a finding about a caller pattern goes there.
- Input schemas under `shared/models/db` — `schemas` owns their shape, this ledger only checks the router imports rather than declares them.

## Next enforceable

**Both decidable halves now belong to `scripts/oxlint/trpcProcedure.ts`**, found by hand in two consecutive units
before being handed over:

- `trpc-procedure/no-hand-rolled-error` — **on across `server/trpc/**`**, since rows 1-2 cleared the tree. It
  Reports a `new TRPCError` whose `message` reads `.message` off an error class a guard constructor already
  Wraps, and a `BAD_REQUEST` carrying no message at all. `guards/*.ts` is exempt: those files are the
  Constructors. A bare `UNAUTHORIZED` is not reported — `errorLink.ts` states the authorization guards throw it.
- `trpc-procedure/require-return-type` — **now on across `server/trpc/**`**. It reports a `.query`/`.mutation`
  With no type argument. `.subscription` is out of scope: an async generator carries its yield type as a callback
  Annotation. It landed as a ratchet over swept paths only and widened to the whole tree as the rows cleared,
  Which is the shape to reuse — a rule enabled over unswept territory buys disables, not coverage.

Still with the sweep, because no rule can decide them: procedure builder choice is a policy question about the
Route's data, and client-path-mirrors-file-path would be a test walking both trees rather than a lint rule.
