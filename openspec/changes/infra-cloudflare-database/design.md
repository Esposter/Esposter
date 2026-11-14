# Cloudflare database

Part of the [Cloudflare program](../infra-cloudflare-program/design.md). Every row moves to D1: the Postgres schema to the `core` database, the Azure Table data to the `streams` database, and the message search index to an FTS5 table in `streams`. Tests run on Miniflare's D1.

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

The check-SQL helpers under `src/services/shared` keep their names and emit SQLite (`length()` for `char_length()`, no `::` casts). `drizzle.config.ts` uses the `sqlite` dialect with the `d1-http` driver for `db:migrate`, and two configurations — `core` and `streams` — each write their own migrations folder; the Postgres migration history is deleted, since D1 starts from a fresh first migration and the data is copied by the [cutover](../infra-cloudflare-cutover/design.md).

## Transactions

D1 has no interactive transaction. Each `db.transaction(async (tx) => ...)` in the server, the functions app and `packages/db` becomes one of:

- **A batch** — `db.batch([q1, q2, ...])` — when its statements do not read each other's results. Atomic: all apply or none.
- **One conditional statement** — when it reads a row and decides: `insert ... onConflictDoNothing().returning()`, `update ... where(<the condition it read>).returning()`; an empty result is the losing branch.
- **A unique constraint** — when two concurrent writers must not both succeed; the second write fails and is mapped to the same error the read-then-throw returned.

A transaction that awaits a non-database call between statements (a blob write, a queue send) splits: the database writes become a batch, and the outside call runs after it succeeds, or before it when its failure must stop the write.

## Postgres-only queries

`ilike` becomes `like`, which is case-insensitive for ASCII in SQLite; `pg_trgm` similarity on resource search becomes FTS5 over the searched columns in `core`, ranked by `bm25`. `sql` fragments using `now()`, `interval`, `::` casts, `array_agg`, `jsonb_*` or `RETURNING` with Postgres-only syntax are rewritten to SQLite's equivalents. The rate limiter's `rate-limiter-flexible` Drizzle store is created with the SQLite table.

## The streams database

Azure Table's model is kept: each `StreamTable` (renamed from `AzureTable`) is a D1 table of `partitionKey`, `rowKey`, `etag` and `entity` (the serialized entity as JSON), with the primary key on the first two. A `StreamTableClient<TEntity>` implements the subset of `TableClient` the code calls — create, get, update, upsert, delete, list with a filter, and submit a transaction — so the fifty-odd call sites keep their entity classes and their `serializeEntity`/`deserializeEntity` path, and change only how they get the client. A list filter is the OData subset the code writes (`eq`, `ne`, `lt`, `le`, `gt`, `ge`, `and`, `or`, `not`, string, datetime and boolean literals), compiled to a `WHERE` over `json_extract(entity, '$.<field>')`, with `PartitionKey` and `RowKey` mapped to their columns. A transaction is a `db.batch`. Rejected: one typed Drizzle table per entity class, which rewrites every reader of every message kind for a shape the entity classes already describe.

## Search

`messages_search` is an FTS5 table in `streams` over `message`, `filename` and `senderName`, with `partitionKey`, `rowKey`, `userId`, `createdAt` and `deletedAt` as unindexed columns. Every write of a message row writes its search row in the same batch; a soft delete sets `deletedAt` in both. `searchMessages` and `readMySentMessages` query it, weighting `message` 3 and `senderName` 1.5 in `bm25`, the `messageBoost` profile's weights. Deleting a room's documents is a delete by `partitionKey`.

## Tests

`packages/db-mock` creates a Miniflare instance with the two D1 databases, applies both migration folders, and returns the Drizzle clients; R2 buckets and Queues come from the same instance. One instance is shared per test file and its databases are emptied between tests. `azure-mock` and the PGlite dependency are deleted.

## Key files

| File                                                           | Role after the change                          |
| :------------------------------------------------------------- | :--------------------------------------------- |
| `packages/db-schema/src/pgTable.ts`                            | replaced by the SQLite table factory           |
| `packages/db-schema/src/models/PgTable.ts`                     | replaced by its SQLite type                    |
| `packages/db-schema/src/createMetadataSchema.ts`               | SQLite timestamps                              |
| `packages/db-schema/src/services/shared/createNameCheckSql.ts` | SQLite check SQL, as every sibling helper      |
| `packages/db-schema/drizzle.config.ts`                         | the `core` and `streams` SQLite configurations |
| `packages/db-schema/src/models/azure/table/AzureTable.ts`      | renamed to the stream table enum               |
| `packages/db/src/services/azure/table/getTableClient.ts`       | replaced by the D1 stream table client         |
| `packages/db/src/services/azure/search/getSearchClient.ts`     | replaced by FTS5 queries                       |
| `apps/web/server/db/index.ts`                                  | Drizzle over the `core` binding                |
| `apps/web/server/services/message/searchMessages.ts`           | reads `messages_search`                        |
| `apps/web/server/services/rateLimiter/createRateLimiter.ts`    | the SQLite rate limiter table                  |
| `packages/db-mock/src/createMockDb.ts`                         | Miniflare's D1 with both migration folders     |
| `packages/azure-mock/package.json`                             | deleted                                        |
