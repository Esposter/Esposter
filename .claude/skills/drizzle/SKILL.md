---
name: drizzle
description: Esposter Drizzle ORM conventions — column naming (camelCase matching property), pgTable wrapper for metadata, schema placement, select patterns, relational vs SQL-style API preference, and v2 relation definitions (defineRelationsPart, optional:false, naming). Apply when writing or modifying DB schema files in packages/db-schema or tRPC routers.
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

## Relations (v2 API)

This project uses Drizzle ORM v2's `defineRelationsPart` API. **Never use the v1 `relations()` function** — it is incompatible with v2.

### File Structure

- **Relations live in separate files** under `packages/db-schema/src/relations/`, one file per table (e.g. `friendsRelation.ts`).
- **Never define relations inside schema files** — schema files (`packages/db-schema/src/schema/*.ts`) must not import from `drizzle-orm` `relations` or define any `*Relations` with `relations()`.
- **Register every relation file** in `packages/db-schema/src/relations.ts` — both the import and the spread into the `relations` export object.
- **Always export from `schema.ts`** — every table file must be spread into the `schema` object in `packages/db-schema/src/schema.ts`. Missing this breaks `db.query.*` at runtime.

### Defining Relations

```ts
// packages/db-schema/src/relations/friendsRelation.ts
import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const friendsRelation = defineRelationsPart(schema, (r) => ({
  friends: {
    receiver: r.one.users({
      from: r.friends.receiverId,
      optional: false,
      to: r.users.id,
    }),
    sender: r.one.users({
      from: r.friends.senderId,
      optional: false,
      to: r.users.id,
    }),
  },
}));
```

### `optional: false`

- **Always set `optional: false` on `r.one` when the FK column is `notNull()`** — Drizzle v2 defaults to optional (nullable result), which is incorrect for non-nullable FKs. Omitting this produces wrong TypeScript types (e.g. `user: User | null` instead of `user: User`).
- **Omit `optional` (or set `optional: true`) only when the FK column is nullable** — e.g. a soft-delete `deletedAt` style optional foreign key.

### Naming Conventions

- **`r.one` relations use singular, descriptive names** — name the relation after what it represents, not the table:
  - FK to `users` → `user`
  - FK to `roomsInMessage` → `roomInMessage`
  - FK to `appUsersInMessage` (bot user) → `appUser` (not `appUsersInMessage`)
  - FK to `achievements` → `achievement`
- **`r.many` relations use camelCase plural** — name after the junction/child table:
  - `usersToRoomsInMessage` (the junction table name)
  - `webhooksInMessages` (plural of `webhooksInMessage`)
- **Through relations (many-to-many)** use `{target}Via{JunctionTable}` pattern:
  - `usersViaInvitesInMessage`, `postsViaLikes`, `achievementsViaUserAchievements`
- **`alias` is required for through relations** — use `"{targetTable}_id_{sourceTable}_id_via_{junctionTable}"` format:
  ```ts
  alias: "roomsInMessage_id_users_id_via_invitesInMessage";
  ```

### v2 `where` Syntax

The v2 relational API uses **object-based `where`** (not callbacks):

```ts
// CORRECT — v2 object syntax
const room = await ctx.db.query.roomsInMessage.findFirst({
  where: { id: { eq: input }, userId: { eq: userId } },
});

// For EXISTS subqueries, use RAW escape hatch
const room = await ctx.db.query.roomsInMessage.findFirst({
  where: {
    RAW: (roomsInMessage, { and, eq, exists }) => {
      const where = and(eq(roomsInMessage.id, input), exists(...));
      if (!where) throw new InvalidOperationError(...);
      return where;
    },
  },
});

// WRONG — v1 callback syntax (incompatible with v2)
where: (rooms, { and, eq }) => and(eq(rooms.id, input), eq(rooms.userId, userId)),
```

### `with:` Eager Loading Workaround

Due to [drizzle-team/drizzle-orm#695](https://github.com/drizzle-team/drizzle-orm/issues/695), eager-loaded relation shapes must be specified as a constant object exported from the relation file:

```ts
// In the relation file (e.g. usersToRoomsInMessageRelation.ts)
export const UserToRoomInMessageRelations = {
  roomInMessage: true,
  user: true,
} as const;

// In the router
const result = await ctx.db.query.usersToRoomsInMessage.findFirst({
  where: { ... },
  with: UserToRoomInMessageRelations,
});
```

### `createSelectSchema`

- **Always import `createSelectSchema` from `drizzle-orm/zod`** — never from `drizzle-zod` (that is the v1 package):
  ```ts
  import { createSelectSchema } from "drizzle-orm/zod"; // ✓
  import { createSelectSchema } from "drizzle-zod"; // ✗
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
