---
name: drizzle
description: Apply when writing or modifying DB schema files in packages/db-schema, the Durable Object schemas in apps/functions, or tRPC routers. Esposter's Drizzle ORM conventions for D1 and the object SQLite — how a table, a relation and a query are written, how its names are derived, and how a migration is produced.
---

# Drizzle ORM Conventions

## Settled — do not re-propose

- **A hand-kept registry, or a test that a registry is complete** — `pnpm registry:gen` writes both from the folders, so a declaration is registered by existing and there is nothing left to check (`references/schema-registration.md`).
- **A table without its product area's prefix** — SQLite has no schemas, so the area is the table-name prefix (`message_rooms`), and `packages/db-schema/src/schema.test.ts` holds it (`references/schemas-and-names.md`).
- **A table writing its own copy of a column group the others share** — rejected: parallel tables share their columns through a factory, because a builder reused across tables shares one config (`references/table-definition.md`).
- **Following `drizzle-kit`'s own skills (`pnpm-drizzle-kit-*`) where they differ from this one** — they describe the tool in general, `push` and CLI-applied migrations included; this skill wins, since `db:gen` is the only generator (`references/migrations.md`, and the package's apply path in `packages/db-schema/README.md`).
- **A bare table export (`rooms`, `users`)** — it collides with a local of the same name, a row type or a name another module already exports (the `UserStatus` enum); the `In<Area>` suffix is derived, never chosen, and `packages/db-schema/src/schema.test.ts` holds it.

## Deep dives

- `references/relations-v2.md` — when adding or editing a file in `packages/db-schema/src/relations/`, or writing a relational query's `where` / `orderBy` / `with`.
- `references/migrations.md` — when running `db:gen`, editing a generated `migration.sql`, or recovering a forked migration chain.
- `references/table-constraints.md` — when adding a CHECK constraint or a unique constraint, or naming a constraint or index.
- `references/indexes.md` — when a query's filter or order needs an index, or a count runs on a path every render pays for.
- `references/table-definition.md` — when adding or editing a table, a column, a reference or a bitfield.
- `references/schemas-and-names.md` — when adding a table, choosing its product area, naming anything derived from a table, or moving a table to another area.
- `references/schema-registration.md` — when adding a table or a relation part, or when a generated registry looks wrong.
- `references/queries.md` — when writing a query: the select shape, relational or SQL-style, a self-join, a batch insert.
- `references/returning.md` — when a write returns its rows: `requireMutation`, the full entity, `[0]` against `takeOne`, and a lost claim.
- `references/primary-keys.md` — when choosing a new table's primary key.
- `references/d1-transactions.md` — when a write is more than one statement, or a read decides what a write does.
- `references/json-arrays.md` — when a query filters on a list of ids that may be long, or reads a JSON text array.
- `references/fts5.md` — when a table is searched by its text, or a search index changes.
- `references/durable-object-schemas.md` — when adding or editing a table in a Durable Object's own SQLite: the room, call or user object.

## D1 and Object SQLite

- **No interactive transactions on D1** — a multi-statement write is one `db.batch([...])`, applied atomically, and a read-then-decide becomes one guarded statement or a unique constraint the losing write fails on (`references/d1-transactions.md`).
- **A long `IN` list is bound once, as a JSON array** — D1 caps a statement at 100 bound parameters, so `inJsonArray` and `notInJsonArray` from `@esposter/db` bind the whole list (`references/json-arrays.md`).
- **A JSON text array is read with `json_each`**, since SQLite has no array type and no array operator (`references/json-arrays.md`).
- **Message search is FTS5 in external-content mode** over the room's integer `id` rowid, kept in step by triggers in the same migration (`references/fts5.md`).
- **A bitfield that outgrows a JS number is stored as decimal TEXT** — `createBitfieldColumn()` stores it and reads it back as a `bigint` (`references/table-definition.md`).
- **An object's own schema is a SQLite schema in its folder**, with its own migrations folder (`references/durable-object-schemas.md`).

## Column Names

A column builder is called bare, never with a name string (`no-restricted-syntax`): the `sqliteTable` wrapper names every column after its key (`references/table-definition.md`).

## Table Definition

- **Every core table goes through the `sqliteTable` wrapper** (`packages/db-schema/src/sqliteTable.ts`), and **every DB identifier is camelCase** — the table name is the bare noun, held by `schema.test.ts`.
- **A column holding another table's id gets `.references()`**, with the `onDelete` the domain means — except a column projected from user-authored content on every save, which stays a bare id.
- **Parallel tables share their column group, as a factory function** — `createRoomUserColumns()` spread into each table of the group, `createMetadataSchema()` into every table; a call builds fresh builders, so no table inherits another's. A rename where the names differ is a migration. Factor the predicate with the `create*CheckSql` helpers too (`references/table-definition.md`).
- The full statement of each, and why a suite fighting a new reference is reporting its own fixtures: `references/table-definition.md`.

## Schemas, Names and Registries

- **Every table lives under its product area's prefix** — a folder under `src/schema/`, `<area>_<table>` in D1, never unprefixed (`references/schemas-and-names.md`).
- **Every name drizzle derives from a table carries its area** — `usersInAuth`, `UserInAuth`, `selectUserInAuthSchema`, `usersInAuthRelation` — held by `schema.test.ts` (`references/schemas-and-names.md`).
- **The registries are generated** — `pnpm registry:gen`, run by `build` and `db:gen`; nothing is registered by hand (`references/schema-registration.md`).

## Selects

`getColumns(table)` for a flat result, `{ alias: table }` for a namespaced one, and a bare `.select()` only for one table (`references/queries.md`).

## Query API: Relational vs SQL-style

The relational API for every read; SQL-style for writes, multi-column `OR` joins, aggregates and upserts; a read's `limit` is `MAX_READ_LIMIT` or `DEFAULT_READ_LIMIT` (`references/queries.md`).

## Relations (v2 API) — at a glance

- **Never the v1 `relations()` function** (`no-restricted-syntax`) — the repo is on Drizzle v2's `defineRelationsPart`, and v1 is incompatible.
- **`where` and `orderBy` are object-based, never v1 callbacks** — `where: { id: { eq: input } }`, `orderBy: { createdAt: "desc" }`.
- **`createSelectSchema` always imports from `drizzle-orm/zod`**, never from `drizzle-zod` (the v1 package, a `no-restricted-syntax` error).

## Self-Joins (Same Table Twice)

Both sides of a self-join are `alias()`es named `foo1`, `foo2` (`references/queries.md`).

## Batch Inserts

One `INSERT` over an array, never a loop of them (`references/queries.md`).

## `.returning()`

`requireMutation` on the first row, the full entity returned, and `[0]` rather than `takeOne` wherever a guard reads the absence (`references/returning.md`).

## Empty-Sentinel Columns

A column's empty value and its insert side are the `absent-values` skill's (`references/sentinel-columns.md`); the schema carries the sentinel, so Drizzle's inferred types propagate it.

## Time Duration Columns

**A duration is stored in milliseconds**, never seconds, minutes or hours unless it needs sub-millisecond precision, and its column carries the `Ms` suffix (the `naming` skill, "No abbreviations") — `durationMs: integer().notNull()`.

## Primary Keys

A text id for an entity other tables reference, a text natural key, a composite for a pure join table, and a random code as `id` where one already identifies the row (`references/primary-keys.md`).

## Migrations

- **`db:gen` (from `packages/db-schema/`) is the only way to produce a migration, and `snapshot.json` is machine state, never hand-cloned** — a copied snapshot forks the chain the instant two migrations descend from one parent (`references/migrations.md`).
- **`db:gen` is never run as an unprompted side effect** of a schema edit — note the pending migration and let the user decide. Migrations apply to `core` through `pnpm --filter @esposter/db-schema db:migrate`, and `apps/web`'s `predev` applies them locally with `wrangler d1 migrations apply CORE --local`.
