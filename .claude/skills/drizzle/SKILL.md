---
name: drizzle
description: Esposter Drizzle ORM conventions — column naming (camelCase matching property), pgTable wrapper for metadata, schema placement, select patterns, relational vs SQL-style API preference, and v2 relation definitions (defineRelationsPart, optional:false, naming). Apply when writing or modifying DB schema files in packages/db-schema or tRPC routers.
---

# Drizzle ORM Conventions

## Column Names

Column name string must exactly match the TypeScript property key (camelCase). Never snake_case.

```typescript
receiverId: text("receiverId").notNull(), // not "receiver_id"
isHidden: boolean("isHidden").notNull().default(false),
```

## Table Definition

- Use `pgTable` wrapper from `@/pgTable` (not raw `drizzle-orm/pg-core`) for all tables, including join tables. Pass composite PKs via `extraConfig`.
- Pass `schema: messageSchema` for all message-feature tables to group them under the `message` Postgres schema.

```typescript
export const friends = pgTable("friends", { id: text("id").primaryKey(), ... }, { schema: messageSchema });
```

## Registering Exports in the `schema` Object

**Every schema export — tables AND `pgEnum`s — must be added to the `schema` object in `packages/db-schema/src/schema.ts`** (both the import and the object key, kept alphabetical). This is not optional bookkeeping; the object is the single source consumed by:

- `db.query.*` at runtime — a missing table breaks relational queries.
- `generateMigration` / `generateDrizzleJson` (drizzle-kit), which feed `pnpm db:gen` and the `db-mock` snapshot generator (`pnpm snapshot:gen`). drizzle-kit only emits `CREATE TYPE` for `pgEnum`s present here. A missing enum produces SQL that references a type that is never created, failing at apply time with `type "..." does not exist` (e.g. a snapshot/migration crash).

A common trap: adding a second enum alongside an existing one and registering only the first. After editing `schema.ts`, run `pnpm build` in `packages/db-schema/` (db-mock and other consumers import the built `dist`, not `src`), then regenerate the snapshot with `pnpm snapshot:gen` in `packages/db-mock/`.

## Selects

- **`getColumns(table)` (from `drizzle-orm`) for flat results** — extracts only column definitions. Use when joining and you want one table's columns flat: `.select(getColumns(users))`. Never spread the table object directly (`{ ...users }`) — it carries metadata beyond columns.
- **`.select({ alias: tableObject })` for namespaced results** — e.g. `.select({ user: users })` → `{ user: User }`, then `.map(({ user }) => user)` to unwrap.
- **`.select()` with no args only when selecting all columns from the FROM table** — adding joins with bare `.select()` mixes joined columns in, losing type clarity.

## Query API: Relational vs SQL-style

- **Prefer the relational API (`db.query.table.findFirst/findMany`) by default** — more readable, type-safe, supports eager loading via `with:`. Use for all reads unless a reason forces SQL-style.
- **Use SQL-style (`db.select/update/delete/insert`) only when necessary**:
  - All mutations (`insert`/`update`/`delete` are SQL-style only).
  - Complex `OR` join conditions spanning multiple FK columns.
  - Aggregations: `db.select({ count: count() }).from(...)`.
  - `onConflictDoNothing` / `onConflictDoUpdate` (upserts).
- **Never use number literals for `limit:`** — use `MAX_READ_LIMIT` (1000) or `DEFAULT_READ_LIMIT` (15) from `#shared/services/pagination/constants`.
- `.map()` to unwrap `with:` results is intentional — Drizzle always nests them.

## Relations (v2 API)

Uses Drizzle v2's `defineRelationsPart`. **Never use the v1 `relations()` function** — incompatible with v2.

### File Structure

- Relations live in separate files under `packages/db-schema/src/relations/`, one file per table (e.g. `friendsRelation.ts`).
- **Never define relations inside schema files** — `packages/db-schema/src/schema/*.ts` must not import `relations` from `drizzle-orm` or define any `*Relations`.
- Register every relation file in `packages/db-schema/src/relations.ts` (both the import and the spread into the `relations` export).
- Register every table and `pgEnum` in the `schema` object in `packages/db-schema/src/schema.ts`.

### Defining Relations

```ts
// packages/db-schema/src/relations/friendsRelation.ts
import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const friendsRelation = defineRelationsPart(schema, (r) => ({
  friends: {
    receiver: r.one.users({ from: r.friends.receiverId, optional: false, to: r.users.id }),
    sender: r.one.users({ from: r.friends.senderId, optional: false, to: r.users.id }),
  },
}));
```

### `optional: false`

- Always set `optional: false` on `r.one` when the FK column is `notNull()`. v2 defaults to optional (nullable result), producing wrong types (`user: User | null` instead of `user: User`).
- Omit `optional` (or set `true`) only when the FK column is nullable (e.g. soft-delete style optional FK).

### Naming Conventions

- **`r.one` → singular, descriptive name after what it represents, not the table:** FK to `users` → `user`, `rooms` → `room`, `appUsers` (bot) → `appUser`, `achievements` → `achievement`.
- **`r.many` → camelCase plural after the junction/child table:** `usersToRooms`, `webhooksInMessages` (plural of `webhooksInMessage`).
- **Through (many-to-many) → `{target}Via{JunctionTable}`:** `usersViaInvitesInMessage`, `postsViaLikes`, `achievementsViaUserAchievements`.
- **`alias` required for through relations** — format `"{targetTable}_id_{sourceTable}_id_via_{junctionTable}"`, e.g. `"rooms_id_users_id_via_invitesInMessage"`.

### v2 `where` Syntax

Object-based `where` (not callbacks). **Almost never use `RAW:`** — all common operators have object syntax:

```ts
where: { id: { eq: input }, userId: { eq: userId } }          // implicit AND
where: { deletedAt: { isNull: true } }                        // isNull / isNotNull
where: { OR: [{ receiverId: { eq: userId } }, { senderId: { eq: userId } }] }
where: {                                                      // nested OR; each OR element is implicitly ANDed
  OR: [
    { blockerId: { eq: userId }, blockedId: { eq: targetId } },
    { blockerId: { eq: targetId }, blockedId: { eq: userId } },
  ],
}
where: { NOT: { id: { gt: 10 } } }
where: { position: { gte: 0 } }   // other operators: gt, gte, lt, lte, ne, in, notIn, like, ilike

// WRONG — v1 callback syntax (incompatible with v2)
where: (rooms, { and, eq }) => and(eq(rooms.id, input), eq(rooms.userId, userId)),
```

**Use `RAW:` ONLY for operators with no object equivalent** — currently `EXISTS` subqueries, `isNull` on a join condition (not a column filter), or raw SQL. When using `RAW:`, always guard against `undefined`:

```ts
where: {
  RAW: (rooms, { and, eq, exists }) => {
    const where = and(eq(rooms.id, input), exists(...));
    if (!where) throw new InvalidOperationError(...);
    return where;
  },
},
```

### v2 `orderBy` Syntax

Object-based (not callbacks):

```ts
orderBy: { createdAt: "desc" }
orderBy: { position: "asc", name: "asc" }

// WRONG — v1 callback syntax
orderBy: (table, { asc }) => [asc(table.position)]
```

### `with:` Eager Loading Workaround

Due to [drizzle-team/drizzle-orm#695](https://github.com/drizzle-team/drizzle-orm/issues/695), eager-loaded relation shapes must be a constant object exported from the relation file. Define `XxxWithRelations` types inline right after the constant. Consumers import both from `@esposter/db-schema`:

```ts
// usersToRoomsRelation.ts
export const UserToRoomRelations = { room: true, user: true } as const;
export type UserToRoomWithRelations = UserToRoom & { room: Room; user: User };

// In the router
const result = await ctx.db.query.usersToRooms.findFirst({ where: { ... }, with: UserToRoomRelations });
```

### `createSelectSchema`

Always import from `drizzle-orm/zod`, never from `drizzle-zod` (the v1 package):

```ts
import { createSelectSchema } from "drizzle-orm/zod"; // ✓
import { createSelectSchema } from "drizzle-zod"; // ✗
```

## Self-Joins (Same Table Twice)

Always use `alias()` for both references — never the raw table object for either side. Name variables and alias strings `tableName1`, `tableName2`, etc. (numeric suffix, no role-based names):

```ts
const usersToRooms1 = alias(usersToRooms, "usersToRooms1");
const usersToRooms2 = alias(usersToRooms, "usersToRooms2");
ctx.db.from(usersToRooms1).innerJoin(usersToRooms2, eq(usersToRooms2.roomId, usersToRooms1.roomId));
```

## Batch Inserts

Always batch over an array — never loop individual `INSERT`s:

```ts
// CORRECT — one INSERT with multiple rows
await tx
  .insert(usersToRooms)
  .values(allUserIds.map((userId) => ({ roomId: room.id, userId })))
  .onConflictDoNothing();
```

## Constraint & Index Naming

Always explicit, descriptive names — never bare column names like `"name"` or `"position"`. Use underscores between components but preserve the column's camelCase.

| Type              | Pattern                         | Example                                        |
| ----------------- | ------------------------------- | ---------------------------------------------- |
| Length check      | `{table}_{column}_length_check` | `"users_name_length_check"`                    |
| Other check       | `{table}_{column}_check`        | `"room_categories_position_check"`             |
| Semantic check    | descriptive phrase              | `"no_self_block"`, `"rooms_name_check"`        |
| Unique constraint | `{table}_{col1}_{col2}_unique`  | `"push_subscriptions_endpoint_user_id_unique"` |
| Index             | `{table}_{col}_index`           | `"blocks_blockedId_index"`                     |
| Composite index   | `{table}_{col1}_{col2}_index`   | `"room_roles_room_id_position_index"`          |

## CHECK Constraints with `sql` Template Literals

- Always use `sql\`\`` template literals — never a raw string.
- **Numeric literals MUST use `sql.raw()`** — bare interpolation makes Drizzle emit a parameterised placeholder (`$1`), invalid in DDL:

  ```ts
  // CORRECT
  check("name", sql`LENGTH(${name}) <= ${sql.raw(ROOM_NAME_MAX_LENGTH.toString())}`);
  // WRONG — becomes LENGTH("name") <= $1 in DDL
  check("name", sql`LENGTH(${name}) <= ${ROOM_NAME_MAX_LENGTH}`);
  ```

- Use `BETWEEN` when a column has both a lower and upper bound:

  ```ts
  check("name", sql`LENGTH(${name}) BETWEEN 1 AND ${sql.raw(ROOM_CATEGORY_NAME_MAX_LENGTH.toString())}`);
  ```

## `.returning()` — Error Handling Pattern

All mutations calling `.returning()` must:

1. **Destructure the first element**: `const [result] = await db.insert(...).returning()`
2. **Guard for undefined and throw** — never return a fallback like `?? []` or `?? null`:
   ```ts
   const [updatedFilter] = await ctx.db
     .insert(roomFiltersInMessage)
     .values({ roomId, words })
     .onConflictDoUpdate({ set: { words }, target: roomFiltersInMessage.roomId })
     .returning();
   if (!updatedFilter)
     throw new TRPCError({
       code: "BAD_REQUEST",
       message: new InvalidOperationError(Operation.Update, DatabaseEntityType.RoomFilter, roomId).message,
     });
   return updatedFilter;
   ```
3. **Return the full entity** — never a subset of fields (e.g. `.words`). Let callers destructure what they need.
4. **Add `DatabaseEntityType` if missing** — add to `packages/db-schema/src/models/shared/DatabaseEntityType.ts`, then run `pnpm build` in `packages/db-schema/` to rebuild dist.

## Migrations

**Never run `pnpm db:gen` or `pnpm db:up` automatically** — let the user decide. After schema changes, note the needed migration and instruct the user to run it manually from `packages/db-schema`:

```sh
pnpm db:gen   # generates migration SQL from schema diff
pnpm db:up    # applies pending migrations to the DB
```

## Nullable String Columns

- **`.notNull().default("")` for optional user-editable text fields** — never `null` as the "not set" state for strings. `""` is the canonical absent value (biography, color, topic, group, description, etc.).
- **Keep `null` only for semantically distinct absence**:
  - URL fields (`image`, `url`) — null means "no image/URL set"; `""` would fail URL validation
  - Fields constrained to `null` by a CHECK constraint (e.g. `roomsInMessage.name` must be `null` for DirectMessage type)
  - Nullable FK references where `null` means the referenced row was deleted (audit trail)
  - Auth-framework-managed fields (`accounts`, `sessions`) — do not touch
- **Update downstream `??` fallbacks to `||`** when a field changes nullable → `""` — `"" ?? fallback` returns `""`, so `??` must become `||`.

## Optional Insert Values

Do not coerce `undefined` to `null` with `?? null` unless null has distinct domain meaning. Omit the key or pass the existing optional value directly. Use explicit `null` only when the schema distinguishes null from absence (nullable FKs, audit fields).

## Time Duration Columns

- **Always store durations in milliseconds** — never seconds/minutes/hours. Only deviate for genuine sub-millisecond precision.
- **Column names carry the `Ms` suffix** — `slowmodeMs`, `durationMs`, `timeoutMs`. Explicit exception to the no-abbreviation rule.

  ```ts
  durationMs: integer("durationMs").notNull(); // not durationMilliseconds
  ```

## Primary Keys

- **UUID PK for entities referenced by other tables** — `id: uuid("id").primaryKey().defaultRandom()`.
- **Text PK for natural-key tables** — computed text PK when uniquely identified by a domain-derived string.
- **Composite PK for pure join tables** — `primaryKey({ columns: [col1, col2] })` when no surrogate is needed.
- **Token-as-PK** — when a generated random token already uniquely identifies the row (invite tokens, call session tokens), use it as `id: text().primaryKey()` directly. Do NOT add a separate `uuid` surrogate alongside a `token` column. The field is always named `id` (never `token`) for shape consistency.

  ```typescript
  // token IS the id — no separate uuid surrogate + token column
  export const callSessionsInMessage = pgTable("call_sessions", {
    id: text().primaryKey(), // the token, generated by createToken(CALL_TOKEN_LENGTH)
    roomId: uuid().unique().references(() => roomsInMessage.id, { onDelete: "cascade" }),
  }, ...);
  ```
