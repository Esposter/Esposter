# Cloudflare database

Part of the [Cloudflare program](../infra-cloudflare-program/design.md). Every row moves to D1: the Postgres schema and the Azure Table data to typed tables in the one `core` database, and the message search index to an FTS5 table over its messages. Tests run on Miniflare's D1.

## The schema on SQLite

`packages/db-schema` keeps one file per table and its folder per Postgres schema. The table factory that replaces `pgTable` builds `sqliteTable` tables; SQLite has no schemas, so a table's SQL name is `<schema>_<name>` (`message_scheduledMessageJobs`) and its TypeScript name keeps its `In<Schema>` suffix, so no importer is renamed. The column mapping is fixed:

| Postgres                                                | SQLite (`drizzle-orm/sqlite-core`)                                    |
| :------------------------------------------------------ | :-------------------------------------------------------------------- |
| `uuid().defaultRandom()`                                | `text().$defaultFn(() => crypto.randomUUID())`                        |
| `uuid()`                                                | `text()`                                                              |
| `timestamp()` / `.defaultNow()`                         | `integer({ mode: "timestamp_ms" })` / `.$defaultFn(() => new Date())` |
| `boolean()`                                             | `integer({ mode: "boolean" })`                                        |
| `jsonb()` / `json()`                                    | `text({ mode: "json" })`, `.$type<T>()` kept                          |
| `integer()`, `smallint()`, `bigint({ mode: "number" })` | `integer()`                                                           |
| `real()`, `doublePrecision()`, `numeric()`              | `real()`                                                              |
| `text()`, `varchar()`                                   | `text()`                                                              |
| a Postgres enum or `text({ enum })`                     | `text({ enum })`                                                      |
| `check(name, sql)`                                      | `check(name, sql)`, the SQL rewritten for SQLite                      |
| `->>`, `?` on jsonb in a check                          | `json_extract(col, '$.key')`, `json_type(col, '$.key') IS NOT NULL`   |
| `index`, `uniqueIndex`, `.where(...)`                   | the same, partial indexes supported                                   |

The check-SQL helpers under `src/services/shared` keep their names and emit SQLite (`length()` for `char_length()`, no `::` casts). `drizzle.config.ts` uses the `sqlite` dialect with the `d1-http` driver for `db:migrate`, writing one migrations folder; the Postgres migration history is deleted, since D1 starts from a fresh first migration and the data is copied by the [cutover](../infra-cloudflare-cutover/design.md).

## Transactions

D1 has no interactive transaction. Each `db.transaction(async (tx) => ...)` in the server, the functions app and `packages/db` becomes one of:

- **A batch** — `db.batch([q1, q2, ...])` — when its statements do not read each other's results. Atomic: all apply or none.
- **One conditional statement** — when it reads a row and decides: `insert ... onConflictDoNothing().returning()`, `update ... where(<the condition it read>).returning()`; an empty result is the losing branch.
- **A unique constraint** — when two concurrent writers must not both succeed; the second write fails and is mapped to the same error the read-then-throw returned.

A transaction that awaits a non-database call between statements (a blob write, a queue send) splits: the database writes become a batch, and the outside call runs after it succeeds, or before it when its failure must stop the write.

## Postgres-only queries

`ilike` becomes `like`, which is case-insensitive for ASCII in SQLite; `pg_trgm` similarity on resource search becomes FTS5 over the searched columns in `core`, ranked by `bm25`. `sql` fragments using `now()`, `interval`, `::` casts, `array_agg`, `jsonb_*` or `RETURNING` with Postgres-only syntax are rewritten to SQLite's equivalents. The rate limiter's `rate-limiter-flexible` Drizzle store is created with the SQLite table.

## The former Azure Table data

A room's messages, their reactions and their search move into the room's own object, per the [realtime](../infra-cloudflare-realtime/design.md) design. The other former Azure Tables — moderation logs and notes, program participants, resource activity, resource views and survey responses — are ordinary Drizzle tables in `core`. A field read by a `WHERE`, an `ORDER BY`, a join or a foreign key is a real column with the index its query needs; a reference is a foreign key with its cascade, so deleting a room or a user removes its rows with no sweep; only a nested shape no query reads stays a JSON column. Azure's partition keys, reverse-ticked row keys, etags and entity serializer go with the service: newest-first is `ORDER BY id DESC` over the time-ordered id, a count is `COUNT(*)`, and a view counter is one `INSERT … ON CONFLICT DO UPDATE SET count = count + 1` on a row per resource per day.

Rejected: a second `streams` database holding Azure Table's model as generic rows, which ported Azure's limitations into a database without them. Rejected: messages as a D1 table, which put the one unbounded, room-local data set in the shared database and still needed the objects for the sockets.

## Tests

`packages/db-mock` creates a Miniflare instance with the D1 database, applies its migration folder, and returns the Drizzle client; R2 buckets and Queues come from the same instance. One instance is shared per test file and its databases are emptied between tests. `azure-mock` and the PGlite dependency are deleted.

## Key files

| File                                                           | Role after the change                      |
| :------------------------------------------------------------- | :----------------------------------------- |
| `packages/db-schema/src/pgTable.ts`                            | replaced by the SQLite table factory       |
| `packages/db-schema/src/models/PgTable.ts`                     | replaced by its SQLite type                |
| `packages/db-schema/src/createMetadataSchema.ts`               | SQLite timestamps                          |
| `packages/db-schema/src/services/shared/createNameCheckSql.ts` | SQLite check SQL, as every sibling helper  |
| `packages/db-schema/drizzle.config.ts`                         | the `core` SQLite configuration            |
| `packages/db-schema/src/models/azure/table/AzureTable.ts`      | renamed to the stream table enum           |
| `packages/db/src/services/azure/table/getTableClient.ts`       | replaced by the D1 stream table client     |
| `packages/db/src/services/azure/search/getSearchClient.ts`     | replaced by FTS5 queries                   |
| `apps/web/server/db/index.ts`                                  | Drizzle over the `core` binding            |
| `apps/web/server/services/message/searchMessages.ts`           | reads `messages_search`                    |
| `apps/web/server/services/rateLimiter/createRateLimiter.ts`    | the SQLite rate limiter table              |
| `packages/db-mock/src/createMockDb.ts`                         | Miniflare's D1 with both migration folders |
| `packages/azure-mock/package.json`                             | deleted                                    |
