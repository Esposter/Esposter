---
name: drizzle
description: Esposter Drizzle ORM conventions — column naming (camelCase matching property), pgTable wrapper for metadata, schema placement, select patterns, relational vs SQL-style API preference, and v2 relation definitions (defineRelationsPart, optional:false, naming). Apply when writing or modifying DB schema files in packages/db-schema or tRPC routers.
---

# Drizzle ORM Conventions

## Column Names

- **Column names must exactly match the TypeScript property name (camelCase)** — the string argument passed to `text()`, `uuid()`, `boolean()`, etc. must be identical to the property key on the left. Never use snake_case column names.

  ```typescript
  // CORRECT
  receiverId: text("receiverId").notNull(),
  roomId: uuid("roomId").notNull(),
  isHidden: boolean("isHidden").notNull().default(false),

  // WRONG
  receiverId: text("receiver_id").notNull(),
  roomId: uuid("room_id").notNull(),
  ```

## Table Definition

- **Use `pgTable` wrapper from `@/pgTable`** (not raw `drizzle-orm/pg-core`) for all tables — including join tables. Pass composite PKs via `extraConfig`.
- **Pass `schema: messageSchema`** for all message-feature tables to group them under the `message` Postgres schema.

  ```typescript
  export const friends = pgTable(
    "friends",
    { id: text("id").primaryKey(), ... },
    { schema: messageSchema },
  );
  ```

## Selects

- **Use `getColumns(table)` for flat results** — `getColumns` (from `drizzle-orm`) extracts only the column definitions from a table object. Use it when joining and you want one table's columns flat:
  ```ts
  .select(getColumns(users))
  ```
  Never spread the table object directly (`{ ...users }`) — the table object contains metadata beyond columns.
- **Use `.select({ alias: tableObject })` for namespaced results** — e.g. `.select({ user: users })` when you want the result nested under a key (`{ user: User }`), then `.map(({ user }) => user)` to unwrap.
- **Use `.select()` with no args only when selecting all columns from the FROM table** — adding joins while using `.select()` mixes all joined columns into the result, losing type clarity.

## Query API: Relational vs SQL-style

- **Prefer the relational API (`db.query.table.findFirst/findMany`) by default** — it is more readable, type-safe, and supports eager loading via `with:`. Use it for all reads unless a specific reason forces SQL-style.
- **Use SQL-style (`db.select/update/delete/insert`) only when necessary**:
  - All mutations: `db.insert()`, `db.update()`, `db.delete()` — these are SQL-style only.
  - Complex `OR` join conditions that span multiple FK columns.
  - Aggregations: `db.select({ count: count() }).from(...)`.
  - `onConflictDoNothing` / `onConflictDoUpdate` (upsert patterns).
- **Never use number literals for `limit:`** — use `MAX_READ_LIMIT` (1000) or `DEFAULT_READ_LIMIT` (15) from `#shared/services/pagination/constants`.
- **Use `with:` for eager loading** in the relational API. `.map()` to unwrap is intentional — Drizzle always nests `with:` results.

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
  - FK to `rooms` → `room`
  - FK to `appUsers` (bot user) → `appUser`
  - FK to `achievements` → `achievement`
- **`r.many` relations use camelCase plural** — name after the junction/child table:
  - `usersToRooms` (the junction table name)
  - `webhooksInMessages` (plural of `webhooksInMessage`)
- **Through relations (many-to-many)** use `{target}Via{JunctionTable}` pattern:
  - `usersViaInvitesInMessage`, `postsViaLikes`, `achievementsViaUserAchievements`
- **`alias` is required for through relations** — use `"{targetTable}_id_{sourceTable}_id_via_{junctionTable}"` format:
  ```ts
  alias: "rooms_id_users_id_via_invitesInMessage";
  ```

### v2 `where` Syntax

The v2 relational API uses **object-based `where`** (not callbacks). **Almost never use `RAW:`** — all common operators have first-class object syntax:

```ts
// Simple equality (implicit AND when multiple fields)
where: { id: { eq: input }, userId: { eq: userId } }

// isNull / isNotNull
where: { deletedAt: { isNull: true } }
where: { unlockedAt: { isNotNull: true } }

// AND + isNull combined (implicit AND)
where: { roomId: { eq: roomId }, userId: { eq: userId }, deletedAt: { isNull: true } }

// OR — use OR: array
where: { OR: [{ receiverId: { eq: userId } }, { senderId: { eq: userId } }] }

// Nested OR with AND (each element of OR: is implicitly ANDed)
where: {
  OR: [
    { blockerId: { eq: userId }, blockedId: { eq: targetId } },
    { blockerId: { eq: targetId }, blockedId: { eq: userId } },
  ],
}

// NOT
where: { NOT: { id: { gt: 10 } } }

// Other operators: gt, gte, lt, lte, ne, in, notIn, like, ilike
where: { position: { gte: 0 } }
where: { name: { like: "John%" } }
where: { id: { in: [1, 2, 3] } }

// WRONG — v1 callback syntax (incompatible with v2)
where: (rooms, { and, eq }) => and(eq(rooms.id, input), eq(rooms.userId, userId)),
```

**Use `RAW:` ONLY for operators with no object equivalent** — currently: `EXISTS` subqueries, `isNull` on a join condition (not a column filter), or raw SQL expressions. When using `RAW:`, always guard against `undefined`:

```ts
// RAW only when genuinely needed (e.g. EXISTS)
where: {
  RAW: (rooms, { and, eq, exists }) => {
    const where = and(eq(rooms.id, input), exists(...));
    if (!where) throw new InvalidOperationError(...);
    return where;
  },
},
```

### v2 `orderBy` Syntax

The v2 relational API uses **object-based `orderBy`** (not callbacks):

```ts
// CORRECT — v2 object syntax
orderBy: { createdAt: "desc" }
orderBy: { position: "asc", name: "asc" }

// WRONG — v1 callback syntax
orderBy: (table, { asc }) => [asc(table.position)]
```

### `with:` Eager Loading Workaround

Due to [drizzle-team/drizzle-orm#695](https://github.com/drizzle-team/drizzle-orm/issues/695), eager-loaded relation shapes must be specified as a constant object exported from the relation file:

```ts
// In the relation file (e.g. usersToRoomsRelation.ts)
export const UserToRoomRelations = {
  room: true,
  user: true,
} as const;

// In the router
const result = await ctx.db.query.usersToRooms.findFirst({
  where: { ... },
  with: UserToRoomRelations,
});
```

### `WithRelations` Types

- **Define `XxxWithRelations` types inline in the relation file** — place them directly after the `XxxRelations` constant.

  ```ts
  // usersToRoomsRelation.ts
  export const UserToRoomRelations = { room: true, user: true } as const;
  export type UserToRoomWithRelations = UserToRoom & { room: Room; user: User };
  ```

- **Import from `@esposter/db-schema`** — consumers always import `XxxWithRelations` from the package.

### `createSelectSchema`

- **Always import `createSelectSchema` from `drizzle-orm/zod`** — never from `drizzle-zod` (that is the v1 package):
  ```ts
  import { createSelectSchema } from "drizzle-orm/zod"; // ✓
  import { createSelectSchema } from "drizzle-zod"; // ✗
  ```

## Self-Joins (Same Table Twice)

- **Always use `alias()` for both references** when joining a table to itself — never use the raw table object for either side.
- **Name variables and alias strings `tableName1`, `tableName2`, etc.** — consistent numeric suffix, no role-based names:

  ```ts
  const usersToRooms1 = alias(usersToRooms, "usersToRooms1");
  const usersToRooms2 = alias(usersToRooms, "usersToRooms2");
  ctx.db.from(usersToRooms1).innerJoin(usersToRooms2, eq(usersToRooms2.roomId, usersToRooms1.roomId));
  ```

## Batch Inserts

- **Always use batch inserts over sequential inserts** — never loop over an array and issue individual `INSERT` statements:

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

## CHECK Constraints with `sql` Template Literals

- **Always use `sql\`\`` template literals** for CHECK constraint expressions — never pass a raw string.
- **Numeric literals MUST use `sql.raw()`** — bare number interpolation makes Drizzle produce a parameterised placeholder (`$1`), which is invalid in DDL:

  ```ts
  // CORRECT
  check("name", sql`LENGTH(${name}) <= ${sql.raw(ROOM_NAME_MAX_LENGTH.toString())}`);

  // WRONG — becomes LENGTH("name") <= $1 in DDL
  check("name", sql`LENGTH(${name}) <= ${ROOM_NAME_MAX_LENGTH}`);
  ```

- **Use `BETWEEN` when a column has both a lower and upper bound**:

  ```ts
  check("name", sql`LENGTH(${name}) BETWEEN 1 AND ${sql.raw(ROOM_CATEGORY_NAME_MAX_LENGTH.toString())}`);
  ```

## Migrations

- **Never run `pnpm db:gen` or `pnpm db:up` automatically** — always let the user decide when to generate and apply migrations. After schema changes, note what migration is needed and instruct the user to run it manually from `packages/db-schema`:
  ```sh
  pnpm db:gen   # generates migration SQL from schema diff
  pnpm db:up    # applies pending migrations to the DB
  ```

## Primary Keys

- **UUID PK for entities that are referenced by other tables** — `id: uuid("id").primaryKey().defaultRandom()`.
- **Text PK for natural-key tables** — use a computed text PK when the row is uniquely identified by a domain-derived string.
- **Composite PK for pure join tables** — `primaryKey({ columns: [col1, col2] })` when there is no surrogate needed.
