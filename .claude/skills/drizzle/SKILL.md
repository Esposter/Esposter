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

- **Use `pgTable` wrapper from `@/pgTable`** (not raw `drizzle-orm/pg-core`) for all tables — including join tables. Pass composite PKs via `extraConfig`.
- **Pass `schema: messageSchema`** for all message-feature tables to group them under the `message` Postgres schema.

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

- **Never use number literals for `limit:`** — use `MAX_READ_LIMIT` (1000) or `DEFAULT_READ_LIMIT` (15) from `#shared/services/pagination/constants`.
- **Use `with:` for eager loading** in the relational API. `.map()` to unwrap is intentional — Drizzle always nests `with:` results.

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

## Relation Constants

- **Export a `XxxRelations` constant from every schema file used in `with:` clauses** — placed after `xxxRelations = relations(...)`, includes `@TODO` comment. Named `PascalCase` matching the entity type:

  ```ts
  // posts.ts
  export const postsRelations = relations(posts, ({ many, one }) => ({...}));
  // @TODO: https://github.com/drizzle-team/drizzle-orm/issues/695
  export const PostRelations = {
    likes: true,
    user: true,
  } as const;
  ```

- **Use `XxxRelations` in router `with:` instead of inline objects** — import the constant from `@esposter/db-schema` and pass it to `with:`:

  ```ts
  // CORRECT
  with: FriendRequestRelations,

  // WRONG — inline object
  with: { sender: true },
  ```

- **New schema files** must be exported from `src/index.ts` — add `export * from "./schema/myNewTable"`.

## Relations (Schema Definitions)

- **Define `relations()` for every table** — required for `db.query.*` and `with:` eager loading even if FK columns exist.
- **Add reciprocal entries** — `sender: one(users)` on `friends` requires `sentFriendRequests: many(friends, { relationName: "sender" })` on `users`.
- **Export from `schema.ts`** — every table must be spread into the `schema` object in `packages/db-schema/src/schema.ts` or `db.query.*` breaks at runtime.
- **`relationName` required when two FK columns point to the same table** (e.g. `friends.senderId` and `friends.receiverId` both FK to `users`):

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

## Self-Joins (Same Table Twice)

- **Always use `alias()` for both references** when joining a table to itself — never use the raw table object for either side. Drizzle does not auto-alias; using the raw table twice emits the same SQL table name in both join clauses.
- **Name variables and alias strings `tableName1`, `tableName2`, etc.** — consistent numeric suffix, no role-based names:

  ```ts
  const usersToRooms1 = alias(usersToRooms, "usersToRooms1");
  const usersToRooms2 = alias(usersToRooms, "usersToRooms2");
  ctx.db.from(usersToRooms1).innerJoin(usersToRooms2, eq(usersToRooms2.roomId, usersToRooms1.roomId));
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

## Constraint & Index Naming

Always use explicit, descriptive names — never bare column names like `"name"` or `"position"`.

| Type              | Pattern                         | Example                                        |
| ----------------- | ------------------------------- | ---------------------------------------------- |
| Length check      | `{table}_{column}_length_check` | `"users_name_length_check"`                    |
| Other check       | `{table}_{column}_check`        | `"room_categories_position_check"`             |
| Semantic check    | descriptive phrase              | `"no_self_block"`, `"rooms_name_check"`        |
| Unique constraint | `{table}_{col1}_{col2}_unique`  | `"push_subscriptions_endpoint_user_id_unique"` |
| Index             | `{table}_{col}_index`           | `"blocks_blockedId_index"`                     |
| Composite index   | `{table}_{col1}_{col2}_index`   | `"room_roles_room_id_position_index"`          |

Use DB column names (snake_case where applicable) in constraint/index names, not TS property names.

```typescript
// CORRECT
check("users_name_length_check", createNameCheckSql(name, USER_NAME_MAX_LENGTH)),
check("room_categories_position_check", sql`${position} >= 0`),
unique("push_subscriptions_endpoint_user_id_unique").on(endpoint, userId),

// WRONG — bare column name, collides across tables, unclear purpose
check("name", createNameCheckSql(name, USER_NAME_MAX_LENGTH)),
check("position", sql`${position} >= 0`),
unique().on(endpoint, userId),
```

## CHECK Constraints with `sql` Template Literals

- **Always use `sql\`\`` template literals** for CHECK constraint expressions — never pass a raw string.
- **Column references interpolate directly** — `${columnRef}` is fine; Drizzle recognises column objects and emits the correct column name in the SQL:
  ```ts
  check("name", sql`LENGTH(${name}) <= ${sql.raw(MAX_LENGTH.toString())}`);
  ```
- **Numeric literals MUST use `sql.raw()`** — bare number interpolation (e.g. `${MY_CONST}`) makes Drizzle produce a parameterised placeholder (`$1`), which is invalid in DDL. Always wrap with `sql.raw(NUMBER.toString())`:

  ```ts
  // CORRECT
  check("name", sql`LENGTH(${name}) <= ${sql.raw(ROOM_NAME_MAX_LENGTH.toString())}`);

  // WRONG — becomes LENGTH("name") <= $1 in DDL
  check("name", sql`LENGTH(${name}) <= ${ROOM_NAME_MAX_LENGTH}`);
  ```

- **Use `BETWEEN` when a column has both a lower and upper bound** — prefer `BETWEEN min AND max` over `>= min AND <= max`. Both bounds must use `sql.raw()`:

  ```ts
  // CORRECT — BETWEEN for min + max
  check("name", sql`LENGTH(${name}) BETWEEN 1 AND ${sql.raw(ROOM_CATEGORY_NAME_MAX_LENGTH.toString())}`);

  // WRONG — verbose AND form
  check("name", sql`LENGTH(${name}) >= 1 AND LENGTH(${name}) <= ${sql.raw(ROOM_CATEGORY_NAME_MAX_LENGTH.toString())}`);
  ```

  When the Zod schema has `.min(1).max(MAX)`, the DB constraint must also enforce the lower bound — use BETWEEN to keep both in sync.

- **String enum literals** that are part of SQL logic (e.g. comparing a pg enum column to a constant) can be hardcoded directly in the template as single-quoted SQL strings:
  ```ts
  check("participant_key_type", sql`(${type} = 'DirectMessage' AND ...) OR (${type} = 'Room' AND ...)`);
  ```

## Migrations

- **Never run `pnpm db:gen` or `pnpm db:up` automatically** — always let the user decide when to generate and apply migrations. After schema changes, note what migration is needed and instruct the user to run it manually from `packages/db-schema`:
  ```sh
  pnpm db:gen   # generates migration SQL from schema diff
  pnpm db:up    # applies pending migrations to the DB
  ```

## Primary Keys

- **UUID PK for entities that are referenced by other tables** — `id: uuid("id").primaryKey().defaultRandom()` for rooms, invites, etc.
- **Text PK for natural-key tables** — use a computed text PK (e.g. `id: text("id").primaryKey()`) when the row is uniquely identified by a domain-derived string (e.g. `friends.id = sorted([senderId, receiverId]).join(ID_SEPARATOR)`). This mirrors the `participantKey` idempotency pattern on `rooms`.
- **Composite PK for pure join tables** — `primaryKey({ columns: [col1, col2] })` when there is no surrogate needed (e.g. `usersToRooms`).
