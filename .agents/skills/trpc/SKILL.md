---
name: trpc
description: Esposter tRPC conventions — return-type generics on the method, async only when there is an await, where input schemas, server event emitters and server/shared/@esposter-db helpers live, useQuery/useMutation for every client read and write, calling conventions for all-optional and UUID inputs, router structure mirroring the file path, Function.prototype router-key collisions, procedure and result naming, base*Router composition with mergeRouters, the three room RBAC procedure builders, ownedBy ownership guards, one router and store per DB table, BAD_REQUEST messages, plus deep dives on router tests, subscription procedures, read/pagination endpoints, and mutations that write blobs. Apply when writing tRPC routers, procedures, or router tests.
---

# tRPC Conventions

## Deep dives

- `references/router-tests.md` — when writing or reviewing a test that drives a tRPC caller.
- `references/subscriptions.md` — when adding a subscription procedure, or deciding whether the caller of a mutation also updates its own store.
- `references/read-endpoints.md` — when writing a `read*` procedure, its pagination input schema, or the `useRead*` composable that calls it.
- `references/blob-mutations.md` — when a mutation deletes or replaces a blob.

## Procedures

- **Return type generic on the method, not as a callback return annotation** — `readFoos: standardAuthedProcedure.query<Foo[]>(async ({ ctx }) => { ... })`. Same for `.mutation<T>(...)`.
  - **A procedure that returns nothing still writes `<void>`.** The generic pins a public API surface, so a handler that later grows a `return` is a compile error rather than a silently widened response every client can now read. `typescript/no-invalid-void-type` is off for exactly this: a generic type argument is a position upstream allows by default, oxlint does not implement that option, and the config yields rather than the correct call sites.
- **Omit `async` when there is no `await`** — e.g. a body that only `return`s a Drizzle query chain.

## Where the Pieces Live

- **Input schemas → `shared/models/db/<feature>/`** — one file per input type, named after the type (`FooBarIdInput.ts`), exporting both the schema (`...Schema`) and the inferred type. Never re-export types from router files; each type lives in exactly one place.
- **Server-only utility functions → `server/services/<feature>/`** — one function per file, named after the function.
- **Also needed by a Pinia store → `shared/services/<feature>/`** — importable on both server and client without duplication.
- **Also needed by `packages/azure-functions` → `packages/db/src/services/`** — Postgres/Drizzle helpers called from both the Nuxt app server and Azure Functions, with `Database` (from `@esposter/db-schema`) as the `db` parameter, exported from `packages/db/src/index.ts`. Callers import from `@esposter/db` **directly** — a shared function never gets a local re-export file, which only adds a second name to grep for. Error-throwing wrappers (`assertCanCreateFoo` etc.) stay in their own packages because they throw package-specific types (`TRPCError` in the app, `InvalidOperationError` in azure-functions) — only the underlying DB query helpers move.
- **Server event emitters → `server/services/<feature>/events/<name>EventEmitter.ts`** — one emitter per file under the feature that owns the events it carries, never a shared `server/services/events/` bucket. The emitter is the feature's own surface: the subscription procedure and every mutation that fires it already live in that feature, so a central bucket would be the only file in the graph that imports all of them.

## Client-Side Calling Conventions

- **Every user-facing client read/write goes through `useQuery` / `useMutation`** (`composables/shared/`). Before hand-rolling a `getResultAsync(...)` around a `$trpc` call, confirm it matches a documented exception — the raw call sites are deliberate, not omissions. Primitive semantics, "Optimistic by default" and the full exception list: `packages/app/content/docs/architecture/client-data.md`.
- **Never call `.query({})` / `.mutate({})` with a bare empty object** — all-optional inputs chain `.prefault({})`, which makes the input itself optional: `$trpc.foo.readFoos.query()`. Same for test callers: `caller.readFoos()`.
- **Omit optional UUID fields instead of passing `undefined`** — when the value comes from a ref defaulting to `""`, use a conditional spread, not `|| undefined`:

  ```ts
  // key absent when empty — not { barId: currentBarId.value || undefined }
  $trpc.foo.readFoos.query(currentBarId.value ? { barId: currentBarId.value } : {});
  ```

- **Guard required UUID fields with an early return** — `if (!currentBarId.value) return;` before the call, rather than letting an empty string reach the UUID validator.

## Router Structure

Routers nested by domain. Root merger: `server/trpc/routers/index.ts`. The client path mirrors the file path segment for segment — `trpc.<feature>.*` is `routers/<feature>/index.ts` and `trpc.<feature>.<sub>.*` is `routers/<feature>/<sub>.ts` — so a nested key is never flattened, and the file for any path is derivable rather than looked up. The two diverge only where a key was renamed to dodge a `Function.prototype` collision.

- **Sub-routers compose in the feature's own `index.ts`** — export a `base*Router` with the feature's own procedures, then `mergeRouters` it with the sub-routers. `routers/index.ts` imports only the composed router, never a sub-router directly.

  ```ts
  // routers/foo/index.ts — the composition root
  export const baseFooRouter = router({ createFoo: ..., updateFoo: ... });
  export const fooRouter = mergeRouters(baseFooRouter, router({ bar: barRouter }));
  ```

- **Exception**: `achievement` is merged separately (via `mergeRouters`) to avoid a circular dep with the router that fires achievement events.
- **Never use `call`, `apply`, `bind`, `then`, `catch` as router keys** — they are `Function.prototype` methods, and tRPC clients use a `Proxy`, so `.call` returns `Function.prototype.call` instead of descending the router, silently breaking the namespace. Use a descriptive compound name: `callSession`, `videoCall`, `roomCall`.

## Procedure & Result Naming

- **Every query names its verb**: `read*` for a fetch, `search*` for a ranked query, `generate*` for a minted credential (a SAS entity, a Web PubSub access url). A bare noun (`buildVersion`) and a `get*` procedure are both wrong — `get*` is for derivation, which is not what a network round trip is.
- **A query answering with a count is a `read*Count`** — `readResourcesCount`, `readMembersCount`,
  `readResourceViewCount`, `readSurveyResponsesCount`. There is no second spelling: whether the caller drove the
  tally with filters or asked for a number belonging to one subject makes no difference to the name, because a
  reader cannot tell those apart and neither can the next author.
- **A grouping answers with rows rather than a number**, so it is plural and named for what it returns —
  `readResourceTagCounts`, `readMemberCountsByTopRole`, matching the `ResourceTagCount[]` /
  `MemberCountByTopRole[]` it hands back. No procedure is named `count*`; that prefix is a pure in-memory tally
  (`naming`), which is not a network round trip.
- **A named type for what a procedure answers with ends in `Result`** — `ReadInviteResult`, `JoinCallResult` — never `Output`, which is the same idea under a second name and leaves the tree with two spellings of one convention. The type is named for the procedure, so it renames when the procedure does.
- `upsert*` for procedures that do `insert().onConflictDoUpdate()` — never `update*` (update implies the record already exists). Domain operation names (`subscribe`, `connect`) are exempt.
- Subscription naming: `on` + exact mutation name (camelCase): `createFoo` → `onCreateFoo`.
- DB result variables named after the entity: `newFoo`, `updatedFoo`, `existingFoo` — never `created`, `updated`, `existing`.

## Procedure Helpers (Room RBAC)

Three builders in `server/trpc/procedure/room/`:

- `getMemberProcedure(schema, roomIdKey)` — verifies caller is a room member; standard message/room operations.
- `getPermissionsProcedure(permission, schema, roomIdKey, rateLimiterType?)` — verifies caller has a specific `RoomPermission`; most common for moderation/admin.
- `getOwnerProcedure(schema, roomIdKey, rateLimiterType?)` — verifies caller owns the room; destructive room operations.

`rateLimiterType` defaults to `RateLimiterType.Standard`; pass another only to opt into a different limiter.

## Ownership Guards in Mutations

- **`ownedBy(table, id, userId)`** (`server/services/db/ownedBy.ts`) — the where-predicate for "this row must belong to the caller": `.where(ownedBy(foos, input, ctx.getSessionPayload.user.id))`. Compose extra clauses with `and(ownedBy(...), isNull(...))`. Never hand-write `and(eq(table.id, id), eq(table.userId, userId))`.
- Repeated multi-clause where-fragments within one router (e.g. "not cancelled and not completed") get a named module-level `const`/helper in that router file. **A parameterised one is a function, so it is named `get*Where`** — `getRoomMembershipWhere(roomId, userId)`, matching `getCursorWhere` and `getNotBlockedWhere` in `server/services/`; only a fragment that takes no arguments is a bare `*Where` const, because that name is then a value rather than a call.

## Router and Store Structure

- **One router + one Pinia store per DB table** — never bundle multiple tables into one router or store.
- **Naming derived from the table name, not semantics** — `foo_bars` → `fooBars` store ref and `readFooBars` procedure, never a semantic rename of the same rows (the table implies the state).
- **Nuxt does NOT auto-import store functions** — always `import { useXxxStore } from "@/store/..."` when calling other stores. Avoid circular imports with a one-way dependency direction: `block` may import `friend` + `friendRequest`; `friendRequest` may import `friend`; `friend` imports neither.

## Error Handling

- **`BAD_REQUEST` always includes a `message`** — never a bare `new TRPCError({ code: "BAD_REQUEST" })`. Use `message: new InvalidOperationError(Operation.X, EntityType, name).message`, picking the `Operation` matching the procedure (`Operation.Read` for a query; `Create`/`Update`/`Delete` for mutations), the entity type, and a `name` identifying the invalid value (`JSON.stringify(input)`, the relevant ID).
- The `typescript` skill's `if/else if` chain rule applies inside procedure bodies: an early-exit `if` that throws is followed by `else if`, even when the conditions are logically independent.
