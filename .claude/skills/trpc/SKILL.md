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

## Variable Naming

- **Use `userId` for the session user's ID** — never use abbreviated or first-person names like `me`, `myId`, `self`:

  ```ts
  // CORRECT
  const userId = ctx.getSessionPayload.user.id;

  // WRONG
  const me = ctx.getSessionPayload.user.id;
  ```

- **Name DB result variables after the entity** — `newFriend`, `updatedFriend`, `existingFriend`, not `created`, `updated`, `existing`.

## Drizzle Query Conditions

- **Use imported operators directly, not the callback form** — when `eq`, `and`, `or`, etc. are already imported from `drizzle-orm`, pass the condition directly instead of using the relational query callback `(table, { eq }) => eq(table.id, id)`:

  ```ts
  // CORRECT
  ctx.db.query.friends.findFirst({ where: eq(friends.id, id) });

  // WRONG — abbreviated parameter, duplicates already-imported eq
  ctx.db.query.friends.findFirst({ where: (f, { eq }) => eq(f.id, id) });
  ```

  If the callback form must be used (e.g. when the column reference is unavailable), use the full table name as the parameter, not a single-letter abbreviation: `(friends, { eq }) => eq(friends.id, id)`.

## Async Procedures

- **Omit `async` when there is no `await`** — if a procedure body only `return`s a promise (e.g. a Drizzle query chain), drop the `async` keyword:

  ```ts
  // CORRECT — no await, no async
  readFriends: standardAuthedProcedure.query<User[]>(({ ctx }) => {
    return ctx.db.select(...).from(...).where(...);
  })

  // WRONG — async with no await
  readFriends: standardAuthedProcedure.query<User[]>(async ({ ctx }) => {
    return ctx.db.select(...).from(...).where(...);
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

## Subscription Naming

Subscriptions must be named `on` + the **exact mutation procedure name** (camelCase, verbObject order):

- `createMessage` mutation → `onCreateMessage` subscription ✓
- `updateRole` mutation → `onUpdateRole` subscription ✓
- `joinVoiceChannel` mutation → `onJoinVoiceChannel` subscription ✓
- `setMute` mutation → `onSetMute` subscription ✓

The corresponding input schema and exported type follow the same pattern:

- Schema: `onUpdateRoleInputSchema = z.object({ ... })`
- Type: `export type OnUpdateRoleInput = z.infer<typeof onUpdateRoleInputSchema>`

When a single subscription fires for multiple mutation types (e.g. a role-change subscription that covers createRole/updateRole/deleteRole/assignRole/revokeRole), name it after the **primary** mutation it corresponds to (`onUpdateRole`, not `onRoleUpdate`).

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

## Read Endpoints Must Accept Arrays (No N+1)

Every `read*` procedure that may be called for multiple items **must** accept an array of IDs, not a single ID:

```ts
// CORRECT — one request for N items
export const readMemberRolesInputSchema = z.object({
  roomId: selectRoomSchema.shape.id,
  userIds: selectUserSchema.shape.id.array().min(1).max(MAX_READ_LIMIT),
});

// WRONG — forces N requests for N items
export const readMemberRolesInputSchema = z.object({
  roomId: selectRoomSchema.shape.id,
  userId: selectUserSchema.shape.id,
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

## Router Test Patterns

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
