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
