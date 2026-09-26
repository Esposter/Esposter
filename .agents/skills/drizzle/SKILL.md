---
name: drizzle
description: Apply when writing or modifying DB schema files in packages/db-schema or tRPC routers. Esposter Drizzle ORM conventions — bare camelCase column builders through the pgTable wrapper, every table and pgEnum registered in the schema object, the relational API over SQL-style for reads, the v2 relations API (defineRelationsPart, object-based where and orderBy, createSelectSchema from drizzle-orm/zod), .returning() through requireMutation, empty-sentinel columns, Ms-suffixed durations, and db:gen as the only migration generator.
---

# Drizzle ORM Conventions

## Settled — do not re-propose

- **A completeness check over relations** — `relations.ts` spreads its parts rather than holding them, so there is no identity to compare and not every table earns a relation; registration completeness is `schema.test.ts`.

## Deep dives

- `references/relations-v2.md` — when adding or editing a file in `packages/db-schema/src/relations/`, or writing a relational query's `where` / `orderBy` / `with`.
- `references/migrations.md` — when running `db:gen`, editing a generated `migration.sql`, regenerating the db-mock snapshot, or recovering a forked migration chain.
- `references/table-constraints.md` — when adding a CHECK constraint, unique constraint or index to a table.
- `references/table-definition.md` — when adding or editing a table, a column or a reference.
- `references/schema-registration.md` — when adding a table or a `pgEnum`, or a migration fails on a missing type.
- `references/queries.md` — when writing a query: the select shape, relational or SQL-style, a self-join, a batch insert.
- `references/returning.md` — when a write returns its rows: `requireMutation`, the full entity, `[0]` against `takeOne`, and a lost claim.
- `references/sentinel-columns.md` — when adding an optional column or inserting a possibly-absent value.
- `references/primary-keys.md` — when choosing a new table's primary key.

## Column Names

A column builder is called bare, never with a name string (`no-restricted-syntax`): the `pgTable` wrapper names every column after its key (`references/table-definition.md`).

## Table Definition

- **Every table goes through the `pgTable` wrapper**, and **every DB identifier is camelCase** — the table name is the literal DDL name, held by `schema.test.ts`.
- **A column holding another table's id gets `.references()`**, with the `onDelete` the domain means; the one column without one is `resources.boundResourceId`.
- **Each table writes its own column block, even when two are twins** — factor the predicate, never the columns.
- The full statement of each, and why a suite fighting a new reference is reporting its own fixtures: `references/table-definition.md`.

## Registering Exports in the `schema` Object

Every table **and** every `pgEnum` is registered in the `schema` object of `packages/db-schema/src/schema.ts`, or drizzle-kit never creates it (`references/schema-registration.md`).

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

## Empty-Sentinel Columns — the DB Schema Is the Source of Truth

An optional text column is `.notNull().default("")` and a numeric one `.default(0)` where `0` means nothing; `null` stays only for a timestamp or a semantically distinct absence (`references/sentinel-columns.md`).

## Optional Insert Values

Never `?? null` on an insert unless `null` means something the schema distinguishes (`references/sentinel-columns.md`).

## Time Duration Columns

- **Always store durations in milliseconds** — never seconds/minutes/hours. Only deviate for genuine sub-millisecond precision.
- **Column names carry the `Ms` suffix** — `slowmodeMs`, `durationMs`, `timeoutMs` (`durationMs: integer().notNull()`, not `durationMilliseconds`). Explicit exception to the no-abbreviation rule.

## Primary Keys

A UUID for a referenced entity, a text natural key, a composite for a pure join table, and a random code as `id` where one already identifies the row (`references/primary-keys.md`).

## Migrations

**`db:gen` (from `packages/db-schema/`) is the only sanctioned way to produce a migration, and `snapshot.json` is machine state — never hand-clone it.** Copying a previous snapshot and bumping `id`/`prevIds` by hand forks the chain the instant two migrations descend from the same parent, and the next `db:gen` fails with `Non-commutative migrations detected`.

**Don't run `db:gen` as an unprompted side effect** of a schema edit — note the pending migration and let the user decide when to run it. Nothing applies migrations from the CLI; they apply automatically at app startup (`apps/web/server/plugins/migrate.ts`). Running it, fixing up the generated SQL and recovering a damaged chain: `references/migrations.md`.
