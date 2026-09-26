---
name: azure-table
description: Apply when reading or writing Azure Table Storage data (messages, moderation logs) in server code. Esposter Azure Table Storage patterns — partition and row key design, reverse-ticked timestamps, batched and conditional writes (submitTransactionBatches, getEntityWithEtag, updateEntityConditionally), serializeClauses filters, bounded counts, entity constructors and soft-delete.
---

# Azure Table Storage Patterns

## Deep dives

- `references/batch-writes.md` — when writing many entities that share a `partitionKey`, or when a batched write's rows can individually conflict.
- `references/conditional-writes.md` — when a write's body is computed from an entity the same request just read (a votes map, a `files` array, any `"Replace"`).
- `references/testing.md` — when a test must observe, intercept or time a table write, or cross a page boundary.
- `references/keys.md` — when designing a table's keys or generating or decoding a `rowKey`.
- `references/filters.md` — when building a filter for a table read, a count or a purge.
- `references/counting.md` — when a surface shows a count of table rows.
- `references/entities.md` — when writing an entity class or soft-deleting a row.

## Key Constants (from `@esposter/azure`)

- `AZURE_MAX_PAGE_SIZE` — `byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE })` for listing entities.
- `AZURE_MAX_BATCH_SIZE` — the chunk size for `submitTransaction`, Azure's hard limit per call.

Always import them from `@esposter/azure`, never redefine locally.

## Partition / Row Key Design

`partitionKey` is the owning room's id, and `rowKey` is `getReverseTickedTimestamp()` so a scan reads newest-first (`references/keys.md`).

## Reverse-Ticked Timestamps

`getReverseTickedTimestamp` is its own inverse and nanosecond-resolved, so a `rowKey` is never `Date.now()`, an ISO string or a suffixed key, and a test faking timers narrows `toFake` to `["Date"]` (`references/keys.md`).

## Batch Writes

**Never spend a round trip per entity when the entities share a `partitionKey`** — chunk them into `submitTransaction` instead. This is the Azure-side twin of the drizzle skill's batch-insert rule: a loop of `createEntity`/`updateEntity` awaits is one network latency per row, so an unremarkable 1000-row write becomes 1000 sequential calls on a request a user is waiting on. Partition-per-owner designs (`partitionKey = roomId`, `= programId`) mean the writes usually already qualify — check whether they do before reaching for `Promise.all`, which still issues a request per row.

Paginate at `AZURE_MAX_PAGE_SIZE`, chunk transactions at `AZURE_MAX_BATCH_SIZE`, and let `submitTransactionBatches` (`@esposter/db`) own the chunking — never hand-roll the slice loop. A write needing **per-batch** conflict handling is the one case `submitTransactionBatches` can't serve; it chunks with `chunk` (`@esposter/shared`), still never an index-stepping `for` with `.slice()`.

## Read-Modify-Write Is Conditional

A server-side read-modify-write reads through `getEntityWithEtag` and writes through `updateEntityConditionally`, and a rejection is classified with the `checkIs*` helpers, `RestError` taken from `@azure/core-rest-pipeline` (`references/conditional-writes.md`).

## Filter Clauses

Filters are `serializeClauses` over a `Clause<Entity>[]` using `CompositeKeyPropertyNames` for the keys; live rows of a partition are `getLivePartitionClauses`, a whole partition `getPartitionKeyFilter` (`references/filters.md`).

## Counting — Only After a Capped Read, and Bounded

Count only when a capped read filled, and bound the walk when the count is shown — a bounded count is a floor, rendered as one (`references/counting.md`).

## Entity Class Constructors

An entity constructor takes an optional `init?` and reads it with `?.`, since `deserializeEntity` calls it bare (`references/entities.md`).

## Soft-Delete

Soft-delete sets `deletedAt` and `updatedAt` together, and reads filter it out through `getLivePartitionClauses` (`references/entities.md`).
