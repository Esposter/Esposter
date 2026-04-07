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

  // WRONG — abbreviated param, duplicates already-imported eq
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
