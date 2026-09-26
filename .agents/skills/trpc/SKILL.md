---
name: trpc
description: Apply when writing tRPC routers, procedures, or router tests. Esposter tRPC conventions — the return-type generic on the method, one input schema file per procedure under shared/models/db, useQuery/useMutation for every client read and write, router structure mirroring the file path with base*Router composition, read*/search*/generate* procedure names and *Result types, single-entity procedures promoted to a batch only when a caller acts on a set, the three room RBAC procedure builders, ownedBy guards, one router and store per table, and the error constructors a router rejects with.
---

# tRPC Conventions

## Settled — do not re-propose

- **A rule for the procedure builder** — which of the three a route takes is a policy question about the route's data; the decidable rules are the `trpc-procedure` plugin's (`scripts/src/oxlint/trpcProcedure.ts`).
- **A rule that the client path mirrors the file path** — needs both trees, so it would be a test walking them rather than a lint rule.

## Deep dives

- `references/router-tests.md` — when writing or reviewing a test that drives a tRPC caller.
- `references/subscriptions.md` — when adding a subscription procedure, or deciding whether the caller of a mutation also updates its own store.
- `references/read-endpoints.md` — when writing a `read*` procedure, its pagination input schema, or the `useRead*` composable that calls it.
- `references/blob-mutations.md` — when a mutation deletes or replaces a blob.
- `references/procedure-arity.md` — when a procedure acts on an entity, or a surface starts acting on a set of them.
- `references/file-placement.md` — when adding an input schema, a server helper, a shared service or an event emitter.
- `references/client-calls.md` — when client code calls a procedure.
- `references/router-structure.md` — when adding a router, a sub-router or a key, or mapping routers and stores to tables.
- `references/procedure-naming.md` — when naming a procedure, a result type, a subscription or a DB result variable.
- `references/room-procedures.md` — when writing a room-scoped procedure or choosing its builder.
- `references/ownership-guards.md` — when a mutation must touch only the caller's or the room's row, or a router file is about to hold a helper.

## Procedures

- **Return type generic on the method, not as a callback return annotation** — `readFoos: standardAuthedProcedure.query<Foo[]>(async ({ ctx }) => { ... })`. Same for `.mutation<T>(...)`.
  - **A procedure that returns nothing still writes `<void>`.** The generic pins a public API surface, so a handler that later grows a `return` is a compile error rather than a silently widened response every client can now read. `typescript/no-invalid-void-type` is off for exactly this: a generic type argument is a position upstream allows by default, oxlint does not implement that option, and the config yields rather than the correct call sites.
- **One entity until a caller acts on a set, then a batch that replaces it.** Never a single and a batch procedure for the same operation: promotion deletes the single one, and its one-item callers send one id (`references/procedure-arity.md`).
- **Omit `async` when there is no `await`** — e.g. a body that only `return`s a Drizzle query chain.

## Where the Pieces Live

One input schema file per procedure under `shared/models/db/<feature>/`, even for identical shapes; helpers one per file under `server/services/<feature>/`, a store-shared one under `shared/services/`, a Functions-shared query under `packages/db`, and each emitter under its feature's `events/` (`references/file-placement.md`).

## Client-Side Calling Conventions

Every user-facing read and write goes through `useQuery`/`useMutation`; never `.query({})` (`trpc-procedure/no-empty-input`); an empty optional id is omitted and an empty required one returns early (`references/client-calls.md`).

## Router Structure

The client path mirrors the file path; sub-routers compose in the feature's `index.ts` through a `base*Router`; no `Function.prototype` name is a key (`trpc-procedure/no-prototype-key`) (`references/router-structure.md`).

## Procedure & Result Naming

Every query names its verb — `read*`, `search*`, `generate*` (`trpc-procedure/require-query-verb`), a count is `read*Count`, a result type ends in `Result`, `upsert*` for an upsert, `on<Mutation>` for its subscription (`references/procedure-naming.md`).

## Procedure Helpers (Room RBAC)

`getMemberProcedure`, `getPermissionsProcedure` or `getOwnerProcedure` from `server/trpc/procedure/room/`, and a read takes the builder its **data** deserves, never the one its caller's UI implies (`references/room-procedures.md`).

## Ownership Guards in Mutations

`ownedBy(table, id, userId)` and `inRoom(table, id, roomId)`, never a hand-written `and(eq…)`; a router file holds its `router({ ... })` and nothing else (`references/ownership-guards.md`).

## Router and Store Structure

One router and one Pinia store per table, named after the table (`references/router-structure.md`).

## Error Handling

- **`BAD_REQUEST` always carries a message, and the router never assembles it** — `throw getInvalidOperationError(Operation.X, EntityType, name)` from `server/trpc/guards/`, picking the `Operation` matching the procedure (`Operation.Read` for a query; `Create`/`Update`/`Delete` for mutations), the entity type, and a `name` identifying the invalid value (`JSON.stringify(input)`, the relevant ID). A missing entity is `getNotFoundError`; the constructors and the one bare code are the `error-handling` skill's (`references/server-guards.md`).
- The `typescript` skill's `if/else if` chain rule applies inside procedure bodies: an early-exit `if` that throws is followed by `else if`, even when the conditions are logically independent.
