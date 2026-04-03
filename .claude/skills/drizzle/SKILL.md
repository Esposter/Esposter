---
name: drizzle
description: Esposter Drizzle ORM conventions — column naming (camelCase matching property), pgTable wrapper for metadata, schema placement, and select patterns. Apply when writing or modifying DB schema files in packages/db-schema.
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

- **Use `.select({ ...tableObject })` to get flat typed results** — spreading the table object into `select()` returns a flat `TypeName` shaped result matching `typeof table.$inferSelect`. This is the correct pattern when joining tables and you want only one table's columns.
- **Never use `.select(tableObject)` directly** — `select()` expects a `SelectFields` record (`{ key: column }`), not a table object.
- **Use `.select({ alias: tableObject })` for namespaced results** — e.g. `.select({ user: users })` when you want the result nested under a key (`{ user: User }`).
- **Use `.select()` with no args only when selecting all columns from the FROM table** — adding joins while using `.select()` mixes all joined columns into the result, losing type clarity.

## Relations

- **Skip Drizzle relational definitions when using manual joins** — if a router uses explicit `.innerJoin()` / `.leftJoin()` calls (like `directMessage.ts` and `friend.ts`), there is no need to define `relations()` on the table or add `many()` / `one()` entries to related tables.
- **`relationName` is required when two FK columns point to the same table** — Drizzle cannot infer which `one()` side maps to which `many()` side when there is ambiguity (e.g. `friends.senderId` and `friends.receiverId` both FK to `users`). However, since we use manual joins for these cases, the relations definition is omitted entirely.

## Primary Keys

- **UUID PK for entities that are referenced by other tables** — `id: uuid("id").primaryKey().defaultRandom()` for rooms, invites, etc.
- **Text PK for natural-key tables** — use a computed text PK (e.g. `id: text("id").primaryKey()`) when the row is uniquely identified by a domain-derived string (e.g. `friends.id = sorted([senderId, receiverId]).join(ID_SEPARATOR)`). This mirrors the `participantKey` idempotency pattern on `rooms`.
- **Composite PK for pure join tables** — `primaryKey({ columns: [col1, col2] })` when there is no surrogate needed (e.g. `usersToRooms`).
