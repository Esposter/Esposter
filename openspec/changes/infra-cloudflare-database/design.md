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

Every Azure Table becomes ordinary Drizzle tables in `core`, the one database: messages, their metadata (emoji reactions and the like), moderation logs and notes, program participants, resource activity, resource views and survey responses. A field that is read by a `WHERE`, an `ORDER BY`, a join or a foreign key is a real column with the index its query needs; a reference is a foreign key with its cascade, so deleting a room or a user removes its messages with no sweep; only a nested shape no query reads stays a JSON column. Rows take the schema's own ids and `createdAt`/`updatedAt`/`deletedAt` columns like every other table.

Azure's workarounds go with the service, because SQLite sorts and counts natively. There is no partition key, no row key, no reverse-ticked timestamp, no etag and no entity serializer: newest-first is `ORDER BY createdAt DESC, id DESC` over an index on `(roomId, createdAt, id)`, a page is the app's one cursor pagination over the same columns, a count is `COUNT(*)`, and a view counter is one `INSERT … ON CONFLICT DO UPDATE SET count = count + 1` on a row per resource per day. A write touching messages and the relational tables — sending a message and moving its room's `updatedAt` — is one `db.batch`, since both live in one database.

Rejected: a second `streams` database holding Azure Table's model as generic `partitionKey`/`rowKey`/`entity` JSON rows. It ported Azure's limitations into a database that has none of them, kept a clause compiler and an entity serializer alive only to emulate a key-value store, and made a write spanning messages and rooms two databases with no shared batch. Deferred: splitting messages into their own database or a Durable Object per room, revisited when `core` passes half of D1's per-database size limit.

## Search

Message search is an FTS5 table declared with `content='messages'`, kept in step by SQLite triggers on insert, update and delete of the message row, so the index can never disagree with the message and no application code writes it. It indexes the message's plain text, its file names and the sender's name; a query is `MATCH` over user terms each quoted as a literal, joined back to `messages` for the room filter and the soft-delete filter, ranked by `bm25` with the message weighted 3 and the sender 1.5.

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
