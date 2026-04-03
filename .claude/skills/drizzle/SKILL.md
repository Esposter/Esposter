---
name: drizzle
description: Esposter Drizzle ORM conventions — column naming (camelCase matching property), pgTable wrapper for metadata, schema placement, select patterns, and relational vs SQL-style API preference. Apply when writing or modifying DB schema files in packages/db-schema or tRPC routers.
---

# Drizzle ORM Conventions

## Column Names

- **Column names must exactly match the TypeScript property name (camelCase)** — the string argument passed to `text()`, `uuid()`, `boolean()`, `timestamp()`, etc. must be identical to the property key on the left. Never use snake_case column names.

  ```typescript
  // CORRECT
  receiverId: text("receiverId").notNull(),
  roomId: uuid("roomId").notNull(),
  isHidden: boolean("isHidden").notNull().default(false),

  // WRONG
  receiverId: text("receiver_id").notNull(),
  roomId: uuid("room_id").notNull(),
  ```

  This convention is used consistently throughout: `usersToRooms` (`roomId`, `userId`, `isHidden`), `rooms` (`participantKey`, `userId`), `invites` (`roomId`, `userId`).

## Table Definition

- **Use the `pgTable` wrapper from `@/pgTable`** (not the raw `drizzle-orm/pg-core` `pgTable`) for all tables that need `createdAt`, `updatedAt`, `deletedAt` metadata. The wrapper automatically injects `metadataSchema` columns.
- **Exception**: `usersToRooms` uses `messageSchema.table(...)` directly (no metadata) — only follow this pattern when a join table intentionally has no timestamps.
- **Pass `schema: messageSchema`** for all message-feature tables (rooms, users_to_rooms, invites, friends, etc.) to group them under the `message` Postgres schema.

  ```typescript
  // Standard table with metadata + schema
  export const friends = pgTable(
    "friends",
    { id: text("id").primaryKey(), ... },
    { schema: messageSchema },
  );
  ```

## Selects

- **Use `getTableColumns(table)` for flat results** — `getTableColumns` (from `drizzle-orm`) extracts only the column definitions from a table object. Use it when joining and you want one table's columns flat:
  ```ts
  .select(getTableColumns(users))
  ```
  Never spread the table object directly (`{ ...users }`) — the table object contains metadata beyond columns.
- **Use `.select({ alias: tableObject })` for namespaced results** — e.g. `.select({ user: users })` when you want the result nested under a key (`{ user: User }`), then `.map(({ user }) => user)` to unwrap.
- **Use `.select()` with no args only when selecting all columns from the FROM table** — adding joins while using `.select()` mixes all joined columns into the result, losing type clarity.

## Query API: Relational vs SQL-style

- **Prefer the relational API (`db.query.table.findFirst/findMany`) by default** — it is more readable, type-safe, and supports eager loading via `with:`. Use it for all reads unless a specific reason forces SQL-style.
- **Use SQL-style (`db.select/update/delete/insert`) only when necessary**:
  - All mutations: `db.insert()`, `db.update()`, `db.delete()` — these are SQL-style only.
  - Complex `OR` join conditions that span multiple FK columns (e.g. `readFriends` where the joined user is either sender or receiver — the OR condition cannot be expressed in a single `with:` branch without loading both sides).
  - Aggregations: `db.select({ count: count() }).from(...)`.
  - `onConflictDoNothing` / `onConflictDoUpdate` (upsert patterns).
- **Relational API `where` callback** — always use the callback form with destructured operators rather than importing them at the top level:

  ```ts
  // CORRECT — operators from callback
  where: (friends, { and, eq }) => and(eq(friends.receiverId, userId), eq(friends.status, FriendshipStatus.Pending)),

  // AVOID for relational API — importing operators top-level works but mixes styles
  where: eq(friends.receiverId, userId),
  ```

- **Never use number literals for `limit:`** — always use `MAX_READ_LIMIT` (or `DEFAULT_READ_LIMIT` for paginated queries) from `#shared/services/pagination/constants`. `MAX_READ_LIMIT = 1000`, `DEFAULT_READ_LIMIT = 15`.
- **Use `with:` for eager loading instead of manual joins** when using the relational API. The `.map()` to unwrap the related entity is intentional and expected — Drizzle's relational API always nests `with:` results. When Drizzle v2 relational API adds direct column selection on `with:`, the `.map()` can be eliminated:

  ```ts
  // CORRECT — relational API with eager loading; .map() is intentional for now
  const pendingFriendships = await ctx.db.query.friends.findMany({
    where: (friends, { and, eq }) => and(eq(friends.receiverId, userId), eq(friends.status, FriendshipStatus.Pending)),
    with: { sender: true },
  });
  return pendingFriendships.map(({ sender }) => sender);

  // Only use innerJoin when SQL-style is justified (e.g. OR across multiple FKs)
  ctx.db.select(getTableColumns(users)).from(friends).innerJoin(users, or(...)).where(...)
  ```

## Relations (Schema Definitions)

- **Always define `relations()` for every table** — even if the table has FK columns already, Drizzle's relational API requires explicit `relations()` declarations to enable `db.query.*` and `with:` eager loading.
- **Always add reciprocal entries** — if `friends` has `sender: one(users, ...)`, then `users` must have `sentFriendRequests: many(friends, { relationName: "sender" })`.
- **Always export from `schema.ts`** — every table file's exports must be spread into the `schema` object in `packages/db-schema/src/schema.ts`. Missing this breaks `db.query.*` at runtime.
- **`relationName` is required when two FK columns point to the same table** — Drizzle cannot infer which `one()` side maps to which `many()` side when there is ambiguity (e.g. `friends.senderId` and `friends.receiverId` both FK to `users`). Use a string `relationName` on both the `one()` and the matching `many()`:

  ```ts
  // friends.ts
  export const friendsRelations = relations(friends, ({ one }) => ({
    receiver: one(users, { fields: [friends.receiverId], references: [users.id], relationName: "receiver" }),
    sender: one(users, { fields: [friends.senderId], references: [users.id], relationName: "sender" }),
  }));

  // users.ts
  export const usersRelations = relations(users, ({ many }) => ({
    receivedFriendRequests: many(friends, { relationName: "receiver" }),
    sentFriendRequests: many(friends, { relationName: "sender" }),
  }));
  ```

## Batch Inserts

- **Always use batch inserts over sequential inserts** — never loop over an array and issue individual `INSERT` statements. Instead, map to a values array and insert in one statement:

  ```ts
  // CORRECT — one INSERT with multiple rows
  await tx
    .insert(usersToRooms)
    .values(allUserIds.map((userId) => ({ roomId: room.id, userId })))
    .onConflictDoNothing();

  // WRONG — N individual INSERTs
  for (const userId of allUserIds)
    await tx.insert(usersToRooms).values({ roomId: room.id, userId }).onConflictDoNothing();
  ```

  This applies everywhere: seed scripts, junction-table population, bulk upserts, etc. The only exception is when each row's insert result must be inspected individually before proceeding.

## Primary Keys

- **UUID PK for entities that are referenced by other tables** — `id: uuid("id").primaryKey().defaultRandom()` for rooms, invites, etc.
- **Text PK for natural-key tables** — use a computed text PK (e.g. `id: text("id").primaryKey()`) when the row is uniquely identified by a domain-derived string (e.g. `friends.id = sorted([senderId, receiverId]).join(ID_SEPARATOR)`). This mirrors the `participantKey` idempotency pattern on `rooms`.
- **Composite PK for pure join tables** — `primaryKey({ columns: [col1, col2] })` when there is no surrogate needed (e.g. `usersToRooms`).
