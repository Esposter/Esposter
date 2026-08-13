---
name: drizzle
description: Esposter Drizzle ORM conventions — bare column builders (camelCase applied by the pgTable wrapper), the pgTable wrapper and schema placement, registering every table and pgEnum in the schema object, select patterns (getColumns, aliased selects), relational vs SQL-style API preference and read-limit constants, the v2 relations API at a glance (no v1 relations(), object-based where/orderBy, createSelectSchema from drizzle-orm/zod), self-joins, batch inserts, .returning() with requireMutation, empty-sentinel columns and optional insert values, Ms-suffixed duration columns, primary key choice, plus deep dives on writing v2 relation files, generating and fixing migrations, and naming constraints/indexes and writing CHECK constraints. Apply when writing or modifying DB schema files in packages/db-schema or tRPC routers.
---

# Drizzle ORM Conventions

## Deep dives

- `references/relations-v2.md` — when adding or editing a file in `packages/db-schema/src/relations/`, or writing a relational query's `where` / `orderBy` / `with`.
- `references/migrations.md` — when running `db:gen`, editing a generated `migration.sql`, regenerating the db-mock snapshot, or recovering a forked migration chain.
- `references/table-constraints.md` — when adding a CHECK constraint, unique constraint or index to a table.

## Column Names

**Never pass a name string to a column builder** — call it bare. Casing is handled centrally: the `pgTable` wrapper builds through drizzle's `camelCase` helper (`packages/db-schema/src/pgTable.ts`), and `messageSchema` is `camelCase.schema("message")`, so the DB column name is the camelCase property key automatically.

```typescript
barId: text().notNull(), // not text("barId"), never "bar_id"
isHidden: boolean().notNull().default(false),
```

## Table Definition

- Use the `pgTable` wrapper from `@/pgTable` (not raw `drizzle-orm/pg-core`) for all tables, including join tables. Pass composite PKs via `extraConfig`.
- **Every DB identifier is camelCase** — table names, enum names, constraint and index names alike (`pgTable("roomCategories")`, `pgEnum("resourceType")`). The name string is the literal DDL identifier: the wrapper's `camelCase` casing applies to **columns**, and passes the table name through untouched, so nothing normalises it for you and nothing catches a snake_case one at compile time. `schema.test.ts` asserts each table's name equals its exported const, which is what keeps this from drifting again — it drifted once already, into five snake_case tables and eleven snake_case enums, because the rule lived only in this sentence and the sentence was wrong.
- Pass `schema: messageSchema` for message-feature tables to group them under the `message` Postgres schema. Tables shared beyond the messaging feature (`friends`, `users`, `posts`, `blocks`) take no `schema` and land in the default schema.

```typescript
export const foosInMessage = pgTable("foos", { id: uuid().primaryKey().defaultRandom(), ... }, { schema: messageSchema });
```

## Registering Exports in the `schema` Object

**Every schema export — tables AND `pgEnum`s — must be added to the `schema` object in `packages/db-schema/src/schema.ts`** (both the import and the object key, kept alphabetical). The object is the single source consumed by `db.query.*` at runtime (a missing table breaks relational queries) and by drizzle-kit's `generateMigration` / `generateDrizzleJson`, which feed `pnpm db:gen` and the db-mock snapshot generator. drizzle-kit only emits `CREATE TYPE` for `pgEnum`s present here, so a missing enum produces SQL referencing a type that is never created and fails at apply time with `type "..." does not exist`. The common trap is adding a second enum alongside an existing one and registering only the first.

After editing `schema.ts`, run `pnpm build` in `packages/db-schema/` (db-mock and other consumers import the built `dist`, not `src`), then `pnpm snapshot:gen` in `packages/db-mock/`.

## Selects

- **`getColumns(table)` (from `drizzle-orm`) for flat results** — extracts only column definitions. Use when joining and you want one table's columns flat: `.select(getColumns(users))`. Never spread the table object directly (`{ ...users }`) — it carries metadata beyond columns.
- **`.select({ alias: tableObject })` for namespaced results** — `.select({ user: users })` → `{ user: User }`, then `.map(({ user }) => user)` to unwrap.
- **`.select()` with no args only when selecting all columns from the FROM table** — adding joins with bare `.select()` mixes joined columns in, losing type clarity.

## Query API: Relational vs SQL-style

- **Prefer the relational API (`db.query.table.findFirst/findMany`) by default** — more readable, type-safe, supports eager loading via `with:`. Use for all reads unless a reason forces SQL-style.
- **Use SQL-style (`db.select/update/delete/insert`) only when necessary**: all mutations (`insert`/`update`/`delete` are SQL-style only); complex `OR` join conditions spanning multiple FK columns; aggregations (`db.select({ count: count() }).from(...)`); `onConflictDoNothing` / `onConflictDoUpdate`.
- **Never use number literals for `limit:`** — use `MAX_READ_LIMIT` from `@esposter/shared` or `DEFAULT_READ_LIMIT` from `#shared/services/pagination/constants`.
- `.map()` to unwrap `with:` results is intentional — Drizzle always nests them.

## Relations (v2 API) — at a glance

- **Never the v1 `relations()` function** — the repo is on Drizzle v2's `defineRelationsPart`, and v1 is incompatible.
- **`where` and `orderBy` are object-based, never v1 callbacks** — `where: { id: { eq: input } }`, `orderBy: { createdAt: "desc" }`.
- **`createSelectSchema` always imports from `drizzle-orm/zod`**, never from `drizzle-zod` (the v1 package).

## Self-Joins (Same Table Twice)

Always use `alias()` for both references — never the raw table object for either side. Name variables and alias strings `tableName1`, `tableName2`, etc. (numeric suffix, no role-based names):

```ts
const foos1 = alias(foos, "foos1");
const foos2 = alias(foos, "foos2");
ctx.db.from(foos1).innerJoin(foos2, eq(foos2.barId, foos1.barId));
```

## Batch Inserts

Always batch over an array — never loop individual `INSERT`s:

```ts
// CORRECT — one INSERT with multiple rows
await tx
  .insert(foos)
  .values(ids.map((id) => ({ id, parentId })))
  .onConflictDoNothing();
```

## `.returning()`

1. **Wrap the first element in `requireMutation`** — never hand-roll the undefined guard, never fall back to `?? []` / `?? null`. See the error-handling skill (tRPC Backend Guards).
2. **Return the full entity** — never a subset of fields. Let callers destructure what they need.
3. **Add `DatabaseEntityType` if missing** — to `packages/db-schema/src/models/shared/DatabaseEntityType.ts`, then `pnpm build` in `packages/db-schema/` to rebuild dist.
4. **`[0]`, not `takeOne`, when a guard consumes the result.** `takeOne` is a type-level assertion that erases `undefined` from the element type, so it is for access whose absence would be a bug. A row that may legitimately be absent keeps `[0]`: `undefined` is precisely what `requireMutation`, `requireEntity` and a `!row` branch exist to read. Putting `takeOne` in front of a guard types the absent case out of existence and leaves the guard unreachable — the same applies to a locked `SELECT … FOR UPDATE` standing in for `findFirst`, whose whole contract is `T | undefined`.

## Empty-Sentinel Columns — the DB Schema Is the Source of Truth

The schema carries the empty-sentinel convention itself so types and defaults propagate end-to-end through Drizzle's inference — never store `null` and map a sentinel to/from it in app code.

- **`.notNull().default("")` for optional user-editable text fields** — `""` is the canonical absent value (biography, color, topic, description), never `null`.
- **`.notNull().default(0)` for optional numeric fields where `0` has no domain meaning** — e.g. a capacity column `maxFoos`: `0` = unlimited. CHECK constraints treat the sentinel explicitly (`maxFoos = 0 OR foos <= maxFoos`), and queries compare against it (`eq(column, 0)`), not `isNull`.
- **Timestamps keep `null` for absence** — a timestamp has no empty value (`expiresAt`: null = never expires). The mapping from the input's sentinel happens once at the insert site.
- **Keep `null` only for semantically distinct absence** — URL fields (`""` would fail URL validation); fields a CHECK constraint forces to `null` for some row type; nullable FKs where `null` means the referenced row was deleted (audit trail); auth-framework-managed tables (`accounts`, `sessions`), which are not to be touched.
- **Update downstream `??` fallbacks to `||`** when a field changes nullable → `""` — `"" ?? fallback` returns `""`.

## Optional Insert Values

Do not coerce `undefined` to `null` with `?? null` unless null has distinct domain meaning. Omit the key or pass the existing optional value directly. Use explicit `null` only when the schema distinguishes null from absence (nullable FKs, audit fields).

## Time Duration Columns

- **Always store durations in milliseconds** — never seconds/minutes/hours. Only deviate for genuine sub-millisecond precision.
- **Column names carry the `Ms` suffix** — `slowmodeMs`, `durationMs`, `timeoutMs` (`durationMs: integer().notNull()`, not `durationMilliseconds`). Explicit exception to the no-abbreviation rule.

## Primary Keys

- **UUID PK for entities referenced by other tables** — `id: uuid().primaryKey().defaultRandom()`.
- **Text PK for natural-key tables** — computed text PK when uniquely identified by a domain-derived string.
- **Composite PK for pure join tables** — `primaryKey({ columns: [col1, col2] })` when no surrogate is needed.
- **Random-id PK** — when a generated random code already uniquely identifies the row (invites, call sessions), use it as `id: text().primaryKey()` directly, generated by `createId(LENGTH)` from `#shared/util/math/random/createId`. Do NOT add a separate `uuid` surrogate alongside a `token`/`code` column. The field is always named `id` for shape consistency, with a colocated `{ENTITY}_ID_LENGTH` constant + length CHECK.

## Migrations

**`db:gen` (from `packages/db-schema/`) is the only sanctioned way to produce a migration, and `snapshot.json` is machine state — never hand-clone it.** Copying a previous snapshot and bumping `id`/`prevIds` by hand forks the chain the instant two migrations descend from the same parent, and the next `db:gen` fails with `Non-commutative migrations detected`.

**Don't run `db:gen` as an unprompted side effect** of a schema edit — note the pending migration and let the user decide when to run it. Nothing applies migrations from the CLI; they apply automatically at app startup (`packages/app/server/plugins/migrate.ts`). Running it, fixing up the generated SQL and recovering a damaged chain: `references/migrations.md`.
