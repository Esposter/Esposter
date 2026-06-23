---
name: trpc
description: Esposter tRPC conventions — procedure typing with generics, router structure, error handling, and router test patterns. Apply when writing tRPC routers, procedures, or router tests.
---

# tRPC Conventions

## Procedure Return Types

Put the return type generic on the method, not as a callback return annotation. Same rule for `.mutation<T>(...)`.

```ts
readFriends: standardAuthedProcedure.query<User[]>(async ({ ctx }) => { ... })
```

## Async Procedures

Omit `async` when there is no `await` — e.g. a body that only `return`s a Drizzle query chain.

```ts
// CORRECT — no await, no async
readFriends: standardAuthedProcedure.query<User[]>(({ ctx }) => ctx.db.query.friends.findMany(...))
```

## Input Schemas and Utility Functions

- **Input schemas go in `shared/models/db/<feature>/`** — one file per input type, named after the type (e.g. `FriendUserIdInput.ts`). Export both the schema (`...Schema`) and the inferred type. Never re-export types from router files — each type lives in exactly one place.

  ```ts
  // shared/models/db/friend/FriendUserIdInput.ts
  import { selectUserSchema } from "@esposter/db-schema";
  import { z } from "zod";

  export const friendUserIdInputSchema = selectUserSchema.shape.id;
  export type FriendUserIdInput = z.infer<typeof friendUserIdInputSchema>;
  ```

- **Server-only utility functions go in `server/services/<feature>/`** — one function per file, named after the function (e.g. `getFriendshipId.ts`).
- **If also needed by a Pinia store (frontend), put it in `shared/services/<feature>/`** — importable on both server and client without duplication.
- **If also needed by `packages/azure-functions`, put it in `packages/db`** — Postgres/Drizzle functions called from both the Nuxt app server and Azure Functions belong in `packages/db/src/services/` with `PostgresJsDatabase<typeof relations>` as the `db` parameter. Export from `packages/db/src/index.ts`; the app re-exports via a thin `export { fn } from "@esposter/db"` wrapper. Examples: RBAC helpers (`getPermissions`, `hasPermission`), message moderation checks, push subscription queries. Error-throwing wrappers (`assertCanCreateMessage` etc.) stay in their own packages because they throw package-specific types (`TRPCError` in the app, `InvalidOperationError` in azure-functions); only the underlying DB query helpers move to `packages/db`.

## Client-Side Calling Conventions

- **Omit optional UUID fields instead of passing `undefined`** — when the value comes from a ref defaulting to `""` (e.g. `currentRoomId`), use a conditional spread, not `|| undefined`:

  ```ts
  // key absent when empty — not { roomId: currentRoomId.value || undefined }
  $trpc.room.readRooms.query(currentRoomId.value ? { roomId: currentRoomId.value } : {});
  ```

- **Guard required UUID fields with an early return** — add `if (!currentRoomId.value) return;` before the call rather than letting an empty string reach the UUID validator.

## Router Structure

Routers nested by domain. Root merger: `server/trpc/routers/index.ts`.

| Client path                  | Router file                     |
| ---------------------------- | ------------------------------- |
| `trpc.callSession.*`         | `routers/call/index.ts`         |
| `trpc.callSession.knocker.*` | `routers/call/knocker.ts`       |
| `trpc.message.*`             | `routers/message/index.ts`      |
| `trpc.message.emoji.*`       | `routers/message/emoji.ts`      |
| `trpc.message.moderation.*`  | `routers/message/moderation.ts` |
| `trpc.room.*`                | `routers/room/index.ts`         |
| `trpc.room.category.*`       | `routers/room/category.ts`      |
| `trpc.room.directMessage.*`  | `routers/room/directMessage.ts` |
| `trpc.room.filter.*`         | `routers/room/filter.ts`        |

Exception: `achievement` merged separately to avoid circular dep with the router that fires achievement events.

## Router Key Naming

- **Never use `call`, `apply`, `bind`, `then`, `catch` as router keys** — they are `Function.prototype` methods. tRPC clients use a `Proxy`; accessing `.call` returns `Function.prototype.call` instead of descending the router, silently breaking the namespace.
- Use a descriptive compound name: `callSession`, `videoCall`, `roomCall`.

## Procedure & Result Naming

- `upsert*` for procedures that do `insert().onConflictDoUpdate()` — never `update*` (update implies the record already exists). Domain operation names (`subscribe`, `connect`) are exempt.
- Subscription naming: `on` + exact mutation name (camelCase): `createMessage` → `onCreateMessage`, `updateRole` → `onUpdateRole`.
- DB result variables named after the entity: `newFriend`, `updatedFriend`, `existingFriend` — never `created`, `updated`, `existing`.

## Sub-router Composition Pattern

When a feature router has sub-routers, export a `base*Router` with the feature's own procedures, then compose with `mergeRouters`. The feature's `index.ts` is the composition root; `routers/index.ts` only imports the composed router, never sub-routers directly.

```ts
// routers/call/index.ts
export const baseCallRouter = router({ createCall: ..., joinCall: ... });
export const callRouter = mergeRouters(baseCallRouter, router({ knocker: knockerRouter }));

// routers/index.ts
import { callRouter } from "@@/server/trpc/routers/call";
router({ callSession: callRouter, ... }) // knocker already nested inside callRouter
```

## Procedure Helpers (Room RBAC)

Three builders in `server/trpc/procedure/room/`:

- `getMemberProcedure(schema, roomIdKey)` — verifies caller is a room member; standard message/room operations.
- `getPermissionsProcedure(permission, schema, roomIdKey)` — verifies caller has a specific `RoomPermission`; most common for moderation/admin.
- `getOwnerProcedure` — verifies caller owns the room; destructive room operations.

## Router and Store Structure

- **One router + one Pinia store per DB table** — never bundle multiple tables into one router or store.
- **Naming derived from the table name, not semantics:**
  - `friend_requests` table → `friendRequests` store ref, `readFriendRequests` / `readSentFriendRequests` procedures. Never `pendingRequests`/`sentRequests` — the table implies the state.
  - `blocks` table → `blockUser`, `unblockUser`, `readBlockedUsers` procedures; `blockedUsers` store ref.
- **Nuxt does NOT auto-import store functions** — always use explicit `import { useXxxStore } from "@/store/..."` when calling other stores. Avoid circular imports via a one-way dependency direction: `block` may import `friend` + `friendRequest`; `friendRequest` may import `friend`; `friend` imports neither.

## Error Handling

- **`BAD_REQUEST` always includes a `message`** — never throw a bare `new TRPCError({ code: "BAD_REQUEST" })`. Add `message: new InvalidOperationError(Operation.X, EntityType, name).message`. Pick the `Operation` matching the procedure (`Operation.Read` for a query; `Create`/`Update`/`Delete` for mutations), the entity type, and a `name` identifying the invalid value (`JSON.stringify(input)`, the relevant ID, etc.):

  ```ts
  throw new TRPCError({
    code: "BAD_REQUEST",
    message: new InvalidOperationError(Operation.Read, AzureEntityType.Message, JSON.stringify(inFilterRoomIds))
      .message,
  });
  ```

- **`if/else if` when an early-exit `if` is followed by a conditional** — if the first branch throws/returns, the next conditional must be `else if`, even when the conditions are logically independent:

  ```ts
  if (inFilterRoomIds.some((value) => typeof value !== "string")) throw new TRPCError({ ... });
  else if (inFilterRoomIds.length > 0) await isMember(...);
  ```

## Blob Storage Mutations

Delete blobs idempotently — use Azure Blob `deleteIfExists()` for user-triggered cleanup (profile images, survey assets). Avoid `delete()` unless a missing blob must fail the whole mutation.

## Metadata Loading in useRead\* Composables

When a `useRead*` composable fetches a list, load all per-item metadata in a single `readMetadata` helper firing concurrently via `Promise.all`. Both the `readItems` and `readMoreItems` callbacks call the same `readMetadata` so logic is never duplicated.

```ts
const readMetadata = (memberIds: User["id"][]) => {
  if (!currentRoomId.value || memberIds.length === 0) return Promise.resolve();
  const roomId = currentRoomId.value;
  return Promise.all([readUserStatuses(memberIds), readMemberRoles({ roomId, userIds: memberIds })]);
};
```

- Capture reactive refs (e.g. `currentRoomId.value`) into a local `const` before `Promise.all` so all concurrent calls see the same value.
- Guard `memberIds.length === 0` to avoid unnecessary requests.
- Every call inside `Promise.all` must be a **single batch request** — never spread N individual calls (`...ids.map(...)`). If the endpoint accepts one ID, make it accept an array first.

## Pagination Params Schemas

Two factory functions in `shared/models/pagination/`:

- **`createCursorPaginationParamsSchema(sortKeySchema, defaultSortBy)`** — cursor-based; `minimumSortBy` hard-coded to `1` (needs a primary cursor key). `defaultSortBy` is typed `[SortItem<T>, ...SortItem<T>[]]` (non-empty tuple) — TS enforces ≥1 item matching the `min(1)` runtime constraint. Spread `.shape` into a `z.object({...})` and chain `.prefault({})` on the outer object for optional-input procedures.
- **`createOffsetPaginationParamsSchema(sortKeySchema, defaultSortBy?)`** — offset-based; `minimumSortBy` hard-coded to `0` (offset skips N rows without a stable sort key); `defaultSortBy` defaults to `[]`.

Both use `.prefault(defaultSortBy)` (not `.default()`) on `sortBy` — `prefault` applies the default _before_ inner validation, so the default array is itself validated against `.min(minimumSortBy)`. The `defaultSortBy` must satisfy the minimum.

```ts
// CORRECT — cursor: non-empty defaultSortBy, .prefault({}) on outer object
const readRoomsInputSchema = z
  .object({
    ...createCursorPaginationParamsSchema(selectRoomInMessageSchema.keyof(), [
      { key: ItemMetadataPropertyNames.updatedAt, order: SortOrder.Desc },
    ]).shape,
  })
  .prefault({});

// CORRECT — offset: minimumSortBy=0, empty default is fine
const readSurveysInputSchema = createOffsetPaginationParamsSchema(selectSurveySchema.keyof()).prefault({});
```

## Read Endpoints Must Accept Arrays (No N+1)

Every `read*` procedure that may be called for multiple items **must** accept an array of IDs, not a single ID:

```ts
// one request for N items; spread userIdsSchema (max baked in); chain .min(1) when required
export const readMemberRolesInputSchema = z.object({
  ...roomIdSchema.shape,
  userIds: userIdsSchema.shape.userIds.min(1),
});
```

Server: use `inArray(table.userId, userIds)` and include `userId` in the select so the client can group. Client: initialize all requested IDs to `[]` before grouping so users with no results are still set (clearing stale data):

```ts
const readMemberRoles = async (input: ReadMemberRolesInput) => {
  const memberRoles = await $trpc.role.readMemberRoles.query(input);
  const rolesByUserId = new Map<string, RoomRole[]>(input.userIds.map((userId) => [userId, []]));
  for (const { userId, ...role } of memberRoles) rolesByUserId.get(userId)?.push(role);
  for (const [userId, roles] of rolesByUserId) setDataMap(userId, roles);
};
```

## Azure Table Clause Typing

`Clause<T extends Record<string, unknown>>` has no default — always provide the entity type. Never write bare `Clause[]`.

- **Type the array with the entity being queried:** `const clauses: Clause<ModerationLogEntity>[] = [...];`. Never `Clause[]`.
- **Always `CompositeKeyPropertyNames` for `partitionKey`/`rowKey`** — never an entity's own `PropertyNames`, never string literals:

  ```ts
  { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: roomId }
  ```

- **Null clause helpers infer automatically — no explicit type arg:** `getTableNullClause(ItemMetadataPropertyNames.deletedAt)`, `getSearchNullClause(...)`. Never `getTableNullClause<ModerationLogEntity>(...)`.
- **`getCursorWhereAzureTable` returns `Clause<TItem>[]`** — typed via a cast in the body since deserialized cursor keys are plain strings at runtime.
- **Entity-specific fields stay on their own `PropertyNames` constant:** `StandardMessageEntityPropertyNames.isPinned`, `MessageEmojiMetadataEntityPropertyNames.type`; `CompositeKeyPropertyNames.partitionKey`/`rowKey`; `ItemMetadataPropertyNames.deletedAt` for metadata.

## No Redundant Store Updates After Mutations That Emit to a Subscription

When a mutation emits to an event emitter and the subscription fires for **all** connected clients (including the caller — no `getIsSameDevice` filter), the subscription's `onData` handler is the single source of truth. Do NOT also call the `store*` action after the mutation returns.

```ts
// onUpdateRoom subscription fires for the caller too — let it handle the state change
await $trpc.room.updateRoom.mutate(input);
```

| Subscription filters caller?                  | After-mutation store call needed?           |
| --------------------------------------------- | ------------------------------------------- |
| No (`onUpdateRoom` style)                     | ❌ Remove — subscription handles it         |
| Yes (`getIsSameDevice`, `onDeleteRoom` style) | ✅ Required — subscription skips the caller |

When adding a new subscription: decide once which pattern it uses, then be consistent — never mix both.

## Subscription Race Condition — Register Listener Before First `await`

In subscription generators, `on(emitter, event, { signal })` from `node:events` MUST be assigned to a `const` **before** any `await`. The `for await (const x of on(...))` form is NOT equivalent when an `await` precedes it — `on()` only runs when the `for await` line is reached. Synchronously-emitting mutations can fire during that `await` and be missed.

```ts
// CORRECT — listener registered synchronously before control is yielded
async function* ({ ctx, input, signal }) {
  const events = on(callEventEmitter, "muteChanged", { signal });
  await requireCallSession(ctx.db, input);
  for await (const [data] of events) { ... }
}

// WRONG — listener registered after requireCallSession resolves; sync mutations can fire during the await
async function* ({ ctx, input, signal }) {
  await requireCallSession(ctx.db, input);
  for await (const [data] of on(callEventEmitter, "muteChanged", { signal })) { ... }
}
```

In tests, `Promise.all([iterator.next(), mutation()])` exposes this: the mutation runs synchronously after its middleware, emitting while the generator is still blocked on the validation `await`. `node:events` `on()` buffering only saves you if the listener was registered at emit time.

## Router Test Patterns

- **Caller types always use `TRPCRouter` path notation** — never `typeof subRouter`:

  ```ts
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  let roomFilterCaller: DecorateRouterRecord<TRPCRouter["room"]["filter"]>;
  let knockerCaller: DecorateRouterRecord<TRPCRouter["callSession"]["knocker"]>;
  ```

- **Name callers with domain prefix when multiple exist** — `roomCaller`, `directMessageCaller`, `knockerCaller`; never generic `caller`.
- **Always create test resources via `caller.method()`** — never insert rows directly into the DB. Direct insertion bypasses application logic (auth, business rules, cascades), making the tested flow differ from the real one. If a resource belongs to another router, create a second caller via `createCallerFactory(otherRouter)`.
- **Use `assert(value)` to narrow before accessing** — never `!`. After `const [row] = await ...returning()`, call `assert(row)`.
- **Never use bare `.rejects.toThrow()`** — it passes for any error. Always assert the specific error:
  - `.rejects.toThrowErrorMatchingInlineSnapshot(...)` for the full message. Use a template literal when it contains runtime values (UUIDs, entity names); reconstruct computed IDs (e.g. a friendship ID from sorted UUIDs) before the `expect`:
    ```ts
    await expect(caller.create(input)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.Foo, input.id).message}]`,
    );
    ```
  - `.rejects.toBeInstanceOf(ErrorClass)` when only the error type matters.
  - TRPCError snapshot format is `[TRPCError: <message>]` — the prefix comes from TRPCError's `toString()`.
