---
name: drizzle
description: Esposter Drizzle ORM conventions — bare column builders (camelCase applied by the pgTable wrapper), pgTable wrapper for metadata, schema placement, select patterns, relational vs SQL-style API preference, and v2 relation definitions (defineRelationsPart, optional:false, naming). Apply when writing or modifying DB schema files in packages/db-schema or tRPC routers.
---

# Drizzle ORM Conventions

## Column Names

**Never pass a name string to a column builder** — call it bare. Casing is handled centrally: the `pgTable` wrapper builds through drizzle's `camelCase` helper (`packages/db-schema/src/pgTable.ts`), and `messageSchema` is `camelCase.schema("message")`, so the DB column name is the camelCase property key automatically.

```typescript
receiverId: text().notNull(), // not text("receiverId"), never "receiver_id"
isHidden: boolean().notNull().default(false),
```

## Table Definition

- Use `pgTable` wrapper from `@/pgTable` (not raw `drizzle-orm/pg-core`) for all tables, including join tables. Pass composite PKs via `extraConfig`.
- Table name strings stay snake_case plural (`"room_categories"`, `"push_subscriptions"`) — only columns are camelCase.
- Pass `schema: messageSchema` for message-feature tables to group them under the `message` Postgres schema. Tables shared beyond the messaging feature (`friends`, `users`, `posts`, `blocks`) take no `schema` and land in the default schema.

```typescript
export const roomsInMessage = pgTable("rooms", { id: uuid().primaryKey().defaultRandom(), ... }, { schema: messageSchema });
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
- **Never use number literals for `limit:`** — use `MAX_READ_LIMIT` (1000) from `@esposter/shared` or `DEFAULT_READ_LIMIT` (15) from `#shared/services/pagination/constants`.
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
// usersToRoomsInMessageRelation.ts
export const UserToRoomInMessageRelations = { roomInMessage: true, user: true } as const;
export type UserToRoomInMessageWithRelations = UserToRoomInMessage & { roomInMessage: RoomInMessage; user: User };

// In the router
const result = await ctx.db.query.usersToRoomsInMessage.findFirst({ where: { ... }, with: UserToRoomInMessageRelations });
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

Always explicit, descriptive names — never bare column names like `"name"` or `"position"`. Underscores between components; the `{table}` component is the snake_case table name, but the `{column}` components keep their camelCase.

| Type              | Pattern                         | Example                                       |
| ----------------- | ------------------------------- | --------------------------------------------- |
| Length check      | `{table}_{column}_length_check` | `"users_name_length_check"`                   |
| Other check       | `{table}_{column}_check`        | `"room_categories_position_check"`            |
| Semantic check    | descriptive phrase              | `"no_self_block"`, `"rooms_name_check"`       |
| Unique constraint | `{table}_{col1}_{col2}_unique`  | `"push_subscriptions_endpoint_userId_unique"` |
| Index             | `{table}_{col}_index`           | `"blocks_blockedId_index"`                    |
| Composite index   | `{table}_{col1}_{col2}_index`   | `"room_roles_roomId_position_index"`          |

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

1. **Wrap the first element in `requireMutation`** — never hand-roll the undefined guard, never fall back to `?? []` / `?? null`. See the error-handling skill (tRPC Backend Guards).
2. **Return the full entity** — never a subset of fields (e.g. `.words`). Let callers destructure what they need.
3. **Add `DatabaseEntityType` if missing** — add to `packages/db-schema/src/models/shared/DatabaseEntityType.ts`, then run `pnpm build` in `packages/db-schema/` to rebuild dist.

## Migrations

**Never run `pnpm db:gen` or `pnpm db:up` automatically** — let the user decide. After schema changes, note the needed migration and instruct the user to run it manually from `packages/db-schema`:

```sh
pnpm db:gen   # generates migration SQL from schema diff
pnpm db:up    # upgrades snapshot metadata to a newer drizzle-kit format — NOT an apply command
```

Nothing applies migrations from the CLI — they apply automatically at app startup (`packages/app/server/plugins/migrate.ts`). The migrator's bookkeeping hash is `sha256(migration.sql)` only, so `snapshot.json` metadata can be repaired freely for already-applied migrations without touching the DB.

### Snapshot Chain Integrity (when the user asks for db:gen)

- `db:gen` reads `DATABASE_URL` only to satisfy config validation — inject it from `packages/app/.env` (`export DATABASE_URL="$(grep '^DATABASE_URL=' ../app/.env | cut -d= -f2-)"`).
- Every snapshot's `prevIds` must point at the actual head it was built on. Hand-cloning a snapshot from anything but the newest migration forks the chain, and `db:gen` later fails with `Non-commutative migrations detected`. Repair by rewriting the stray branch's snapshots as cumulative state on top of the true head (union the ddl entries, keyed by `entityType|schema|table|name`) and re-pointing `prevIds` — `migration.sql` files stay untouched so applied-hash bookkeeping is safe.
- A hand-cloned snapshot's `ddl` must also be _cumulative_ — it is the base state for every future diff, so entries missing from it get re-emitted as spurious `CREATE`s later.
- drizzle-kit `1.0.0-rc.2` crashes with `Error  Unexpected '''` when semantically comparing json/jsonb defaults stored in the old `'{}'::jsonb` snapshot form (the parse sits outside its try/catch). Normalize the head snapshot's default to `'{}'` and rerun.
- After a successful generate: rename the codename folder descriptively (keep drizzle's timestamp prefix), verify the new snapshot's `prevIds` is the previous head's id, and rerun `db:gen` — it must report `No schema changes, nothing to migrate`.
- Enum-value drift is real: generation may surface enum values that exist in schema + code but were never migrated (a hand-written chain silently misses them). Verify against the live DB (`select enum_range(null::my_enum)`) before assuming the diff is wrong. A value-order mismatch generates a data-preserving text-cast recreate (`SET DATA TYPE text` → `DROP TYPE` → `CREATE TYPE` → cast back) — safe when only one column uses the enum and it has no default.

## Empty-Sentinel Columns — DB Schema Is the Source of Truth

The DB schema carries the empty-sentinel convention itself so types and defaults propagate end-to-end through Drizzle's inference — never store `null` and manually map a sentinel to/from it in app code.

- **`.notNull().default("")` for optional user-editable text fields** — never `null` as the "not set" state for strings. `""` is the canonical absent value (biography, color, topic, group, description, etc.).
- **`.notNull().default(0)` for optional numeric fields where `0` has no domain meaning** — `0` is the canonical absent value (e.g. `invitesInMessage.maxUses`: `0` = unlimited). CHECK constraints treat the sentinel explicitly: `maxUses = 0 OR uses <= maxUses`. Queries compare against the sentinel (`eq(column, 0)`), not `isNull`.
- **Timestamps keep `null` for absence** — a timestamp has no empty value (e.g. `expiresAt`: null = never expires). The mapping from the input's sentinel happens once at the insert site.
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
- **Random-id PK** — when a generated random code already uniquely identifies the row (invites, call sessions), use it as `id: text().primaryKey()` directly. Do NOT add a separate `uuid` surrogate alongside a `token`/`code` column. The field is always named `id` for shape consistency, with a colocated `{ENTITY}_ID_LENGTH` constant + length CHECK.

  ```typescript
  // the random id IS the PK — no separate uuid surrogate
  export const CALL_ID_LENGTH = 12;
  export const callSessionsInMessage = pgTable("call_sessions", {
    id: text().primaryKey(), // generated by createId(CALL_ID_LENGTH) from #shared/util/math/random/createId
    roomId: uuid().unique().references(() => roomsInMessage.id, { onDelete: "cascade" }),
  }, ...);
  ```
