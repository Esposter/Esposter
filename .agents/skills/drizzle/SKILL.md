---
name: drizzle
description: Apply when writing or modifying DB schema files in packages/db-schema or tRPC routers. Esposter's Drizzle ORM conventions — how a table, a relation and a query are written, how its names are derived, and how a migration is produced.
---

# Drizzle ORM Conventions

## Settled — do not re-propose

- **A hand-kept registry, or a test that a registry is complete** — `pnpm registry:gen` writes both from the folders, so a declaration is registered by existing and there is nothing left to check (`references/schema-registration.md`).
- **A table or an enum in `public`** — every one lives in the schema of the product area that owns it (`references/schemas-and-names.md`).
- **A table writing its own copy of a column group the others share** — rejected: parallel tables share their columns through a factory, because a builder reused across tables shares one config (`references/table-definition.md`).
- **Following `drizzle-kit`'s own skills (`pnpm-drizzle-kit-*`) where they differ from this one** — they describe the tool in general, `push` and CLI-applied migrations included; this skill wins, since `db:gen` is the only generator (`references/migrations.md`, and the package's apply path in `packages/db-schema/README.md`).
- **A bare table export (`rooms`, `users`)** — it collides with a local of the same name, a row type or a library's name (livekit's `Room`, the `UserStatus` enum); the `In<Schema>` suffix is derived, never chosen, and `schema.test.ts` holds it.

## Deep dives

- `references/relations-v2.md` — when adding or editing a file in `packages/db-schema/src/relations/`, or writing a relational query's `where` / `orderBy` / `with`.
- `references/migrations.md` — when running `db:gen`, editing a generated `migration.sql`, regenerating the db-mock snapshot, or recovering a forked migration chain.
- `references/table-constraints.md` — when adding a CHECK constraint or a unique constraint, or naming a constraint or index.
- `references/indexes.md` — when a query's filter or order needs an index, a count runs on a path every render pays for, or an index is added to a populated table.
- `references/table-definition.md` — when adding or editing a table, a column or a reference.
- `references/schemas-and-names.md` — when adding a table or an enum, choosing its schema, naming anything derived from a table, or moving a table to another schema.
- `references/schema-registration.md` — when adding a table, an enum, a schema or a relation part, regenerating the db-mock snapshot, or a migration fails on a missing type or schema.
- `references/queries.md` — when writing a query: the select shape, relational or SQL-style, a self-join, a batch insert.
- `references/returning.md` — when a write returns its rows: `requireMutation`, the full entity, `[0]` against `takeOne`, and a lost claim.
- `references/primary-keys.md` — when choosing a new table's primary key.

## Column Names

A column builder is called bare, never with a name string (`no-restricted-syntax`): the `pgTable` wrapper names every column after its key (`references/table-definition.md`).

## Table Definition

- **Every table goes through the `pgTable` wrapper**, and **every DB identifier is camelCase** — the table name is the literal DDL name, held by `schema.test.ts`.
- **A column holding another table's id gets `.references()`**, with the `onDelete` the domain means — except a column projected from user-authored content on every save, which stays a bare id.
- **Parallel tables share their column group, as a factory function** — `createRoomUserColumns()` spread into each table of the group, `createMetadataSchema()` into every table; a call builds fresh builders, so no table inherits another's. A rename where the names differ is a migration. Factor the predicate with the `create*CheckSql` helpers too (`references/table-definition.md`).
- The full statement of each, and why a suite fighting a new reference is reporting its own fixtures: `references/table-definition.md`.

## Schemas, Names and Registries

- **Every table and enum lives in its product area's Postgres schema** — a folder under `src/schema/`, never `public` (`references/schemas-and-names.md`).
- **Every name drizzle derives from a table carries its schema** — `usersInAuth`, `UserInAuth`, `selectUserInAuthSchema`, `usersInAuthRelation` — held by `schema.test.ts` (`references/schemas-and-names.md`).
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

**A duration is stored in milliseconds**, never seconds, minutes or hours unless it needs sub-millisecond precision, and its column carries the `Ms` suffix the `naming` skill sets (`references/numbers-and-time.md`) — `durationMs: integer().notNull()`.

## Primary Keys

A UUID for a referenced entity, a text natural key, a composite for a pure join table, and a random code as `id` where one already identifies the row (`references/primary-keys.md`).

## Migrations

- **`db:gen` (from `packages/db-schema/`) is the only way to produce a migration, and `snapshot.json` is machine state, never hand-cloned** — a copied snapshot forks the chain the instant two migrations descend from one parent (`references/migrations.md`).
- **`db:gen` is never run as an unprompted side effect** of a schema edit — note the pending migration and let the user decide; migrations apply through `pnpm --filter @esposter/db-schema db:migrate`, which `pnpm dev` and the deploy's pre-deploy step run.
