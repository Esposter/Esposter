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

**Both decidable halves now belong to `scripts/oxlint/trpcProcedure.ts`**, found by hand in two consecutive units
before being handed over:

- `trpc-procedure/no-hand-rolled-error` — **on across `server/trpc/**`**, since rows 1-2 cleared the tree. It
  Reports a `new TRPCError` whose `message` reads `.message` off an error class a guard constructor already
  Wraps, and a `BAD_REQUEST` carrying no message at all. `guards/*.ts` is exempt: those files are the
  Constructors. A bare `UNAUTHORIZED` is not reported — `errorLink.ts` states the authorization guards throw it.
- `trpc-procedure/require-return-type` — **a ratchet**, on only for the paths already swept
  (`procedure/**`, `routers/message/**`). It reports a `.query`/`.mutation` with no type argument.
  `.subscription` is out of scope: an async generator carries its yield type as a callback annotation.
  **Each row below widens the glob when it lands** — 36 sites remain outside it, which is what the unswept rows
  Are now mostly made of. Several need a named model type rather than an inline one, which is the judgement the
  Rule cannot make and the sweep exists for.

Still with the sweep, because no rule can decide them: procedure builder choice is a policy question about the
Route's data, and client-path-mirrors-file-path would be a test walking both trees rather than a lint rule.
