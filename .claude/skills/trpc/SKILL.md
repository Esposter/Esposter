---
name: trpc
description: Esposter tRPC conventions — return-type generics on the method, async only when there is an await, where input schemas and server/shared/@esposter-db helpers live, useQuery/useMutation for every client read and write, calling conventions for all-optional and UUID inputs, router structure mirroring the file path, Function.prototype router-key collisions, procedure and result naming, base*Router composition with mergeRouters, the three room RBAC procedure builders, ownedBy ownership guards, one router and store per DB table, BAD_REQUEST messages, Azure Table Clause typing, plus deep dives on router tests, subscription procedures, read/pagination endpoints, and mutations that write blobs. Apply when writing tRPC routers, procedures, or router tests.
---

# tRPC Conventions

## Deep dives

- `references/router-tests.md` — when writing or reviewing a test that drives a tRPC caller.
- `references/subscriptions.md` — when adding a subscription procedure, or deciding whether the caller of a mutation also updates its own store.
- `references/read-endpoints.md` — when writing a `read*` procedure, its pagination input schema, or the `useRead*` composable that calls it.
- `references/blob-mutations.md` — when a mutation deletes or replaces a blob.

## Procedures

- **Return type generic on the method, not as a callback return annotation** — `readFriends: standardAuthedProcedure.query<User[]>(async ({ ctx }) => { ... })`. Same for `.mutation<T>(...)`.
- **Omit `async` when there is no `await`** — e.g. a body that only `return`s a Drizzle query chain.

## Where the Pieces Live

- **Input schemas → `shared/models/db/<feature>/`** — one file per input type, named after the type (`FriendUserIdInput.ts`), exporting both the schema (`...Schema`) and the inferred type. Never re-export types from router files; each type lives in exactly one place.
- **Server-only utility functions → `server/services/<feature>/`** — one function per file, named after the function.
- **Also needed by a Pinia store → `shared/services/<feature>/`** — importable on both server and client without duplication.
- **Also needed by `packages/azure-functions` → `packages/db/src/services/`** — Postgres/Drizzle helpers called from both the Nuxt app server and Azure Functions, with `PostgresJsDatabase<typeof relations>` as the `db` parameter, exported from `packages/db/src/index.ts`; the app re-exports via a thin `export { fn } from "@esposter/db"` wrapper. Error-throwing wrappers (`assertCanCreateMessage` etc.) stay in their own packages because they throw package-specific types (`TRPCError` in the app, `InvalidOperationError` in azure-functions) — only the underlying DB query helpers move.

## Client-Side Calling Conventions

- **Every user-facing client read/write goes through `useQuery` / `useMutation`** (`composables/shared/`). Before hand-rolling a `getResultAsync(...)` around a `$trpc` call, confirm it matches a documented exception — the raw call sites are deliberate, not omissions. Primitive semantics, "Optimistic by default" and the full exception list: `content/docs/architecture/client-data.md`.
- **Never call `.query({})` / `.mutate({})` with a bare empty object** — all-optional inputs chain `.prefault({})`, which makes the input itself optional: `$trpc.survey.readSurveys.query()`. Same for test callers: `caller.readDocuments()`.
- **Omit optional UUID fields instead of passing `undefined`** — when the value comes from a ref defaulting to `""`, use a conditional spread, not `|| undefined`:

  ```ts
  // key absent when empty — not { roomId: currentRoomId.value || undefined }
  $trpc.room.readRooms.query(currentRoomId.value ? { roomId: currentRoomId.value } : {});
  ```

- **Guard required UUID fields with an early return** — `if (!currentRoomId.value) return;` before the call, rather than letting an empty string reach the UUID validator.

## Router Structure

Routers nested by domain. Root merger: `server/trpc/routers/index.ts`. The client path mirrors the file path segment for segment — `trpc.<feature>.*` is `routers/<feature>/index.ts` and `trpc.<feature>.<sub>.*` is `routers/<feature>/<sub>.ts` — so a nested key is never flattened, and the file for any path is derivable rather than looked up. The two diverge only where a key was renamed to dodge a `Function.prototype` collision.

- **Sub-routers compose in the feature's own `index.ts`** — export a `base*Router` with the feature's own procedures, then `mergeRouters` it with the sub-routers. `routers/index.ts` imports only the composed router, never a sub-router directly.

  ```ts
  // routers/call/index.ts — the composition root
  export const baseCallRouter = router({ createCall: ..., joinCall: ... });
  export const callRouter = mergeRouters(baseCallRouter, router({ knocker: knockerRouter }));
  ```

- **Exception**: `achievement` is merged separately (via `mergeRouters`) to avoid a circular dep with the router that fires achievement events.
- **Never use `call`, `apply`, `bind`, `then`, `catch` as router keys** — they are `Function.prototype` methods, and tRPC clients use a `Proxy`, so `.call` returns `Function.prototype.call` instead of descending the router, silently breaking the namespace. Use a descriptive compound name: `callSession`, `videoCall`, `roomCall`.

## Procedure & Result Naming

- `upsert*` for procedures that do `insert().onConflictDoUpdate()` — never `update*` (update implies the record already exists). Domain operation names (`subscribe`, `connect`) are exempt.
- Subscription naming: `on` + exact mutation name (camelCase): `createMessage` → `onCreateMessage`, `updateRole` → `onUpdateRole`.
- DB result variables named after the entity: `newFriend`, `updatedFriend`, `existingFriend` — never `created`, `updated`, `existing`.

## Procedure Helpers (Room RBAC)

Three builders in `server/trpc/procedure/room/`:

- `getMemberProcedure(schema, roomIdKey)` — verifies caller is a room member; standard message/room operations.
- `getPermissionsProcedure(permission, schema, roomIdKey, rateLimiterType?)` — verifies caller has a specific `RoomPermission`; most common for moderation/admin.
- `getOwnerProcedure(schema, roomIdKey, rateLimiterType?)` — verifies caller owns the room; destructive room operations.

`rateLimiterType` defaults to `RateLimiterType.Standard`; pass another only to opt into a different limiter.

## Ownership Guards in Mutations

- **`ownedBy(table, id, userId)`** (`server/services/db/ownedBy.ts`) — the where-predicate for "this row must belong to the caller": `.where(ownedBy(surveys, input, ctx.getSessionPayload.user.id))`. Compose extra clauses with `and(ownedBy(...), isNull(...))`. Never hand-write `and(eq(table.id, id), eq(table.userId, userId))`.
- Repeated multi-clause where-fragments within one router (e.g. "not cancelled and not completed") get a named module-level `const`/helper in that router file.

## Router and Store Structure

- **One router + one Pinia store per DB table** — never bundle multiple tables into one router or store.
- **Naming derived from the table name, not semantics** — `friend_requests` → `friendRequests` store ref and `readFriendRequests` / `readSentFriendRequests` procedures (never `pendingRequests`/`sentRequests`; the table implies the state); `blocks` → `blockUser`, `unblockUser`, `readBlockedUsers`, `blockedUsers`.
- **Nuxt does NOT auto-import store functions** — always `import { useXxxStore } from "@/store/..."` when calling other stores. Avoid circular imports with a one-way dependency direction: `block` may import `friend` + `friendRequest`; `friendRequest` may import `friend`; `friend` imports neither.

## Error Handling

- **`BAD_REQUEST` always includes a `message`** — never a bare `new TRPCError({ code: "BAD_REQUEST" })`. Use `message: new InvalidOperationError(Operation.X, EntityType, name).message`, picking the `Operation` matching the procedure (`Operation.Read` for a query; `Create`/`Update`/`Delete` for mutations), the entity type, and a `name` identifying the invalid value (`JSON.stringify(input)`, the relevant ID).
- The `typescript` skill's `if/else if` chain rule applies inside procedure bodies: an early-exit `if` that throws is followed by `else if`, even when the conditions are logically independent.

## Azure Table Clause Typing

- **`Clause<T extends Record<string, unknown>>` has no default** — type the array with the entity being queried (`const clauses: Clause<ModerationLogEntity>[] = [...]`). Never bare `Clause[]`.
- **Always `CompositeKeyPropertyNames` for `partitionKey`/`rowKey`** — never an entity's own `PropertyNames`, never string literals: `{ key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: roomId }`.
- **Null clause helpers infer automatically** — `getTableNullClause(ItemMetadataPropertyNames.deletedAt)`, never `getTableNullClause<ModerationLogEntity>(...)`. `getCursorWhereAzureTable` returns `Clause<TItem>[]`, typed via a cast in its body since deserialized cursor keys are plain strings at runtime.
- **Entity-specific fields stay on their own `PropertyNames` constant** — `StandardMessageEntityPropertyNames.isPinned`, `MessageEmojiMetadataEntityPropertyNames.type`; `ItemMetadataPropertyNames.deletedAt` for metadata.
