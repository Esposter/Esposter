---
name: trpc
description: Esposter tRPC conventions — procedure typing with generics, router structure, error handling, and router test patterns. Apply when writing tRPC routers, procedures, or router tests.
---

# tRPC Conventions

## Procedure Return Types

- **Use `.query<T>(async ...)` not `.query(async ...): Promise<T>`** — put the return type generic on the method, not as a return type annotation on the callback:

  ```ts
  // CORRECT
  readFriends: standardAuthedProcedure.query<User[]>(async ({ ctx }) => { ... })

  // WRONG
  readFriends: standardAuthedProcedure.query(async ({ ctx }): Promise<User[]> => { ... })
  ```

  Same rule applies to `.mutation<T>(...)`.

## Async Procedures

- **Omit `async` when there is no `await`** — if a procedure body only `return`s a promise (e.g. a Drizzle query chain), drop the `async` keyword:

  ```ts
  // CORRECT — no await, no async
  readFriends: standardAuthedProcedure.query<User[]>(({ ctx }) => {
    return ctx.db.query.friends.findMany(...);
  })

  // WRONG — async with no await
  readFriends: standardAuthedProcedure.query<User[]>(async ({ ctx }) => {
    return ctx.db.query.friends.findMany(...);
  })
  ```

## Input Schemas and Utility Functions

- **Input schemas for procedures go in `shared/models/db/<feature>/`** — one file per input type, named after the type (e.g. `FriendUserIdInput.ts`, `SearchUsersInput.ts`). Export both the schema (`...Schema`) and the inferred type. Never re-export types from router files — each type lives in exactly one place.

  ```ts
  // shared/models/db/friend/FriendUserIdInput.ts
  import { selectUserSchema } from "@esposter/db-schema";
  import { z } from "zod";

  export const friendUserIdInputSchema = selectUserSchema.shape.id;
  export type FriendUserIdInput = z.infer<typeof friendUserIdInputSchema>;
  ```

- **Server-only utility functions go in `server/services/<feature>/`** — one function per file, named after the function (e.g. `getFriendshipId.ts`). Use this when the function is only used by server-side routers/services.

- **If a utility function is also needed by a Pinia store (frontend), put it in `shared/services/<feature>/` instead** — this makes it importable on both server and client without duplication.

## Client-Side Calling Conventions

- **Omit optional UUID fields instead of passing `undefined`** — when a tRPC input has an optional UUID field and the value comes from a ref that defaults to `""` (e.g. `currentRoomId`), use a conditional spread instead of `|| undefined`:

  ```ts
  // CORRECT — key is absent when empty
  $trpc.room.readRooms.query(currentRoomId.value ? { roomId: currentRoomId.value } : {});

  // WRONG — passes undefined as a value
  $trpc.room.readRooms.query({ roomId: currentRoomId.value || undefined });
  ```

- **Guard required UUID fields with an early return** — when `roomId` (or similar) is required by the schema, add `if (!currentRoomId.value) return;` before the call rather than letting an empty string reach the UUID validator:

  ```ts
  // CORRECT
  if (!currentRoomId.value) return;
  const result = await $trpc.room.readMembersByIds.query({ ids, roomId: currentRoomId.value });
  ```

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

- **Never use `call`, `apply`, `bind`, `then`, `catch` as tRPC router keys** — they are `Function.prototype` methods. tRPC clients use a `Proxy`; accessing `.call` returns `Function.prototype.call` instead of descending the router, silently breaking all procedures in that namespace.
- Use a descriptive compound name instead: `callSession`, `videoCall`, `roomCall`, etc.

## Sub-router Composition Pattern

When a feature router has sub-routers, export a `base*Router` with the feature's own procedures, then compose with `mergeRouters`:

```ts
// routers/call/index.ts
export const baseCallRouter = router({
  createCall: ...,
  joinCall: ...,
  // ... all feature procedures
});

export const callRouter = mergeRouters(baseCallRouter, router({ knocker: knockerRouter }));
```

The feature's `index.ts` is the composition root. `routers/index.ts` only imports the composed router — never sub-routers directly.

```ts
// routers/index.ts
import { callRouter } from "@@/server/trpc/routers/call";
router({ callSession: callRouter, ... })
// knocker is already nested inside callRouter — no separate import needed
```

## Procedure Helpers (Room RBAC)

Three builders in `server/trpc/procedure/room/`:

- `getMemberProcedure(schema, roomIdKey)` — verifies caller is a room member; use for standard message/room operations
- `getPermissionsProcedure(permission, schema, roomIdKey)` — verifies caller has a specific `RoomPermission`; most common for moderation/admin actions
- `getOwnerProcedure` — verifies caller owns the room; use for destructive room operations

## Router and Store Structure

- **One router + one Pinia store per DB table** — each table in `packages/db-schema/src/schema/` gets its own router file and its own Pinia store file. Never bundle multiple tables into one router or store.
- **Naming derived from the table name, not from semantics** — use the table name as the basis for procedure and store ref names, not business descriptions:
  - `friend_requests` table → `friendRequests` store ref, `readFriendRequests` procedure, `readSentFriendRequests` procedure
  - Never use descriptive names like `pendingRequests` or `sentRequests` — the table already implies the state
  - `blocks` table → `blockUser`, `unblockUser`, `readBlockedUsers` procedures; `blockedUsers` store ref
- **Nuxt does NOT auto-import store functions** — always use explicit `import { useXxxStore } from "@/store/..."` in files that call other stores. Circular imports are avoided by choosing a one-way dependency direction: `block` store may import `friend` and `friendRequest` stores; `friendRequest` store may import `friend` store; `friend` store imports neither.

## Error Handling

- **`BAD_REQUEST` always includes a `message`** — never throw a bare `new TRPCError({ code: "BAD_REQUEST" })`. Always add `message: new InvalidOperationError(Operation.X, EntityType, name).message` so the error is identifiable. Pick the `Operation` that matches the procedure (e.g. `Operation.Read` for a query, `Operation.Create`/`Operation.Update`/`Operation.Delete` for mutations), the entity type being operated on, and a `name` that identifies the invalid value (`JSON.stringify(input)`, the relevant ID, etc.):

  ```ts
  // CORRECT
  throw new TRPCError({
    code: "BAD_REQUEST",
    message: new InvalidOperationError(Operation.Read, AzureEntityType.Message, JSON.stringify(inFilterRoomIds))
      .message,
  });

  // WRONG — no message, impossible to debug
  throw new TRPCError({ code: "BAD_REQUEST" });
  ```

- **`if/else if` when an early-exit `if` is followed by a conditional** — if the first branch throws (or returns), the next conditional must be `else if`, not a standalone `if`. This applies even when the two conditions are logically independent:

  ```ts
  // CORRECT
  if (inFilterRoomIds.some((value) => typeof value !== "string"))
    throw new TRPCError({ ... });
  else if (inFilterRoomIds.length > 0)
    await isMember(...);

  // WRONG — two standalone ifs when first throws
  if (inFilterRoomIds.some((value) => typeof value !== "string")) throw new TRPCError({ ... });
  if (inFilterRoomIds.length > 0) await isMember(...);
  ```

## Blob Storage Mutations

- **Delete blobs idempotently** — use Azure Blob `deleteIfExists()` for user-triggered cleanup such as removing profile images or survey assets. Avoid `delete()` unless the caller explicitly needs a missing blob to fail the whole mutation.

## Metadata Loading in useRead\* Composables

When a `useRead*` composable fetches a list of entities, load all per-item metadata in a single `readMetadata` helper that fires concurrently via `Promise.all`. Callers (`readItems` callback and `readMoreItems` callback) both call the same `readMetadata` so the logic is never duplicated.

```ts
const readMetadata = (memberIds: User["id"][]) => {
  if (!currentRoomId.value || memberIds.length === 0) return Promise.resolve();
  const roomId = currentRoomId.value;
  return Promise.all([readUserStatuses(memberIds), readMemberRoles({ roomId, userIds: memberIds })]);
};
```

- Capture any reactive refs (e.g. `currentRoomId.value`) into a local `const` before the `Promise.all` so all concurrent calls see the same value.
- Guard `memberIds.length === 0` to avoid unnecessary requests.
- Every call inside `Promise.all` must be a **single batch request** — never spread N individual calls (no `...ids.map((id) => readX({ id }))`). If the endpoint only accepts one ID, make it accept an array first.

## Pagination Params Schemas

Two factory functions in `shared/models/pagination/`:

- **`createCursorPaginationParamsSchema(sortKeySchema, defaultSortBy)`** — cursor-based pagination; `minimumSortBy` is hard-coded to `1` (needs a primary cursor key). `defaultSortBy` is typed `[SortItem<T>, ...SortItem<T>[]]` (non-empty tuple) — TypeScript enforces at least 1 item matches the `min(1)` runtime constraint. Spread `.shape` into a `z.object({...})` and chain `.prefault({})` on the outer object for optional-input procedures.

- **`createOffsetPaginationParamsSchema(sortKeySchema, defaultSortBy?)`** — offset-based pagination; `minimumSortBy` is hard-coded to `0` (offset skips N rows without needing a stable sort key); `defaultSortBy` defaults to `[]`.

Both use `.prefault(defaultSortBy)` (not `.default()`) on the `sortBy` field — `prefault` applies the default _before_ inner validation, so the default array is itself validated against `.min(minimumSortBy)`. The `defaultSortBy` must therefore satisfy the minimum constraint.

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

// WRONG — passing [] as defaultSortBy to cursor schema (TS error: non-empty tuple required)
createCursorPaginationParamsSchema(sortKeySchema, []);
```

## Read Endpoints Must Accept Arrays (No N+1)

Every `read*` procedure that may be called for multiple items **must** accept an array of IDs, not a single ID:

```ts
// CORRECT — one request for N items; spread userIdsSchema/roomIdsSchema (max already baked in); chain .min(1) when required
export const readMemberRolesInputSchema = z.object({
  ...roomIdSchema.shape,
  userIds: userIdsSchema.shape.userIds.min(1),
});

// WRONG — forces N requests for N items
export const readMemberRolesInputSchema = z.object({
  ...roomIdSchema.shape,
  ...userIdSchema.shape,
});
```

Server-side: use `inArray(table.userId, userIds)` and include `userId` in the select so the client can group results. Client-side: initialize all requested IDs to `[]` before grouping so users with no results are still set (clearing stale data):

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

**Type the array with the entity being queried:**

```ts
// CORRECT
const clauses: Clause<ModerationLogEntity>[] = [...];
const clauses: Clause<MessageEntity>[] = [...];

// WRONG — no entity type
const clauses: Clause[] = [...];
```

**Key constants — always `CompositeKeyPropertyNames` for `partitionKey`/`rowKey`:**

```ts
// CORRECT
{ key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: roomId }

// WRONG — partitionKey/rowKey belong to CompositeKey, not the message entity
{ key: StandardMessageEntityPropertyNames.partitionKey, ... }
{ key: "partitionKey", ... }  // never string literals
```

**Null clause helpers infer automatically — no explicit type arg needed:**

```ts
// CORRECT — T inferred from the key argument
getTableNullClause(ItemMetadataPropertyNames.deletedAt);
getSearchNullClause(ItemMetadataPropertyNames.deletedAt);

// WRONG — redundant explicit type arg
getTableNullClause<ModerationLogEntity>(ItemMetadataPropertyNames.deletedAt);
```

**`getCursorWhereAzureTable` returns `Clause<TItem>[]`** — typed via a cast in the body since deserialized cursor keys are plain strings at runtime.

**Entity-specific fields stay on their own `PropertyNames` constant:**

```ts
StandardMessageEntityPropertyNames.isPinned; // ✓ specific to StandardMessageEntity
MessageEmojiMetadataEntityPropertyNames.type; // ✓ specific to that entity
CompositeKeyPropertyNames.partitionKey; // ✓ always for partitionKey/rowKey
ItemMetadataPropertyNames.deletedAt; // ✓ always for metadata fields
```

## No Redundant Store Updates After Mutations That Emit to a Subscription

When a mutation emits to an event emitter and the corresponding subscription fires for **all** connected clients (including the caller — i.e. no `getIsSameDevice` filter), the subscription's `onData` handler is the single source of truth for updating the store. Do **not** also call the `store*` action explicitly after the mutation returns.

```ts
// WRONG — onUpdateRoom subscription fires for caller too; store updated twice
const updatedRoom = await $trpc.room.updateRoom.mutate(input);
storeUpdateRoom(updatedRoom); // ❌ subscription onData already calls this

// CORRECT — let the subscription handle it
await $trpc.room.updateRoom.mutate(input);
```

The two patterns are:

| Subscription filters caller?                  | After-mutation store call needed?           |
| --------------------------------------------- | ------------------------------------------- |
| No (`onUpdateRoom` style)                     | ❌ Remove — subscription handles it         |
| Yes (`getIsSameDevice`, `onDeleteRoom` style) | ✅ Required — subscription skips the caller |

When adding a new subscription: decide once which pattern it uses, then be consistent — never mix both.

## Subscription Race Condition — Register Listener Before First `await`

In tRPC subscription generators, `on(emitter, event, { signal })` from `node:events` MUST be assigned to a `const` **before** any `await`. The idiomatic `for await (const x of on(...))` form is NOT equivalent when an `await` precedes it — `on()` only gets called when the `for await` line is reached (after the `await` completes). Mutations that emit synchronously (no async ops after middleware) can fire during that `await` and be missed.

```ts
// CORRECT — listener registered synchronously before control is yielded
async function* ({ ctx, input, signal }) {
  const events = on(callEventEmitter, "muteChanged", { signal });
  await requireCallSession(ctx.db, input);
  for await (const [data] of events) { ... }
}

// WRONG — listener registered after requireCallSession resolves;
// synchronous mutations (leaveCall, setMute, sendSignal) can fire during that await
async function* ({ ctx, input, signal }) {
  await requireCallSession(ctx.db, input);
  for await (const [data] of on(callEventEmitter, "muteChanged", { signal })) { ... }
}
```

In tests, `Promise.all([iterator.next(), mutation()])` exposes this: the mutation runs synchronously after its middleware, emitting the event while the generator is still blocked on the validation `await`. The buffered-event model in `node:events` `on()` only saves you if the listener was already registered at emit time.

## Router Test Patterns

- **Caller types always use `TRPCRouter` path notation** — never `typeof subRouter`. Use `TRPCRouter["domain"]` for top-level, `TRPCRouter["domain"]["sub"]` for nested:

  ```ts
  // CORRECT
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  let roomFilterCaller: DecorateRouterRecord<TRPCRouter["room"]["filter"]>;
  let knockerCaller: DecorateRouterRecord<TRPCRouter["callSession"]["knocker"]>;

  // WRONG
  let roomFilterCaller: DecorateRouterRecord<typeof filterRouter>;
  ```

- **Name callers with domain prefix when multiple callers exist** — always `roomCaller`, `callSessionCaller`, `knockerCaller`; never generic `caller`.

- **Always create test resources via `caller.method()`** — never insert rows directly into the DB in router tests. Direct DB insertion bypasses application logic (auth checks, business rules, cascades) and means the flow being tested is different from the real flow. If a resource belongs to a different router, create a second caller for that router using `createCallerFactory(otherRouter)`.
- **Name callers after their router** — when a test file has multiple callers, name each one after its router: `roomCaller`, `directMessageCaller`. Never use a generic `caller`.
- **Use `assert(value)` to narrow before accessing** — never use non-null assertion (`!`). After `const [row] = await ...returning()`, call `assert(row)` so TypeScript knows `row` is defined for subsequent lines.
- **Never use `.rejects.toThrow()`** — bare `.toThrow()` passes for any error. Always assert the specific error:
  - `.rejects.toThrowErrorMatchingInlineSnapshot(...)` — for asserting the full error message. Use a template literal to construct the expected string dynamically when it contains runtime values (e.g. UUIDs, entity names):
    ```ts
    await expect(caller.create(input)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.Foo, input.id).message}]`,
    );
    ```
  - `.rejects.toBeInstanceOf(ErrorClass)` — when only the error type matters, not the message.
  - TRPCError snapshot format is `[TRPCError: <message>]` — the prefix comes from TRPCError's `toString()`.
  - When the error message includes a computed ID (e.g. a friendship ID from sorted UUIDs), reconstruct it in the test before the `expect` call.
