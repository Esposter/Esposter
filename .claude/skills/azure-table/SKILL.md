---
name: azure-table
description: Esposter Azure Table Storage patterns — the AZURE_MAX_PAGE_SIZE / AZURE_MAX_BATCH_SIZE constants, partition and row key design, reverse-ticked timestamps and the ascending mirror table, batching writes that share a partitionKey instead of one round trip per row, reading through getEntityWithEtag and writing conditionally, serializeClauses filters, counting only after a capped read and bounding the walk, optional-init entity constructors, and soft-delete, plus deep dives on the submitTransactionBatches write path and conflict replay, the updateEntityConditionally retry loop, and observing or intercepting table writes in tests. Apply when reading or writing Azure Table Storage data (messages, moderation logs) in server code.
---

# Azure Table Storage Patterns

## Deep dives

- `references/batch-writes.md` — when writing many entities that share a `partitionKey`, or when a batched write's rows can individually conflict.
- `references/conditional-writes.md` — when a write's body is computed from an entity the same request just read (a votes map, a `files` array, any `"Replace"`).
- `references/testing.md` — when a test must observe, intercept or time a table write, or cross a page boundary.

## Key Constants (from `@esposter/db-schema`)

| Constant               | Value | When to use                                                         |
| ---------------------- | ----- | ------------------------------------------------------------------- |
| `AZURE_MAX_PAGE_SIZE`  | 1000  | `byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE })` for listing entities |
| `AZURE_MAX_BATCH_SIZE` | 100   | Chunk size for `submitTransaction` — Azure hard limit per call      |

Always import from `@esposter/db-schema`, never redefine locally.

## Partition / Row Key Design

- **`partitionKey` = the owning room id** — `AzureTable.Messages`, `AzureTable.MessagesAscending`, `AzureTable.ModerationLog` all partition by `roomId`. Entity factories take `roomId` and assign it to `partitionKey` (`createMessageEntity`); a transaction can only span one partition, so this is also what makes room-scoped batch writes legal.
- **`rowKey` = `getReverseTickedTimestamp()`** — Azure Table sorts rows within a partition by `rowKey` ascending only, so a reverse-ticked key makes a plain scan return **newest-first** with no sort.
- **`AzureTable.MessagesAscending`** mirrors each message with the tick un-reversed as its `rowKey` (same `partitionKey`) to get oldest-first ordering — see `createMessage` in `@esposter/db`.

## Reverse-Ticked Timestamps

`getReverseTickedTimestamp(timestamp = now())` (`@esposter/db-schema`) returns `AZURE_SELF_DESTRUCT_TIMER - timestamp` as a string, where `now()` (`@esposter/shared`) is epoch **nanoseconds** and `AZURE_SELF_DESTRUCT_TIMER` is `"9".repeat(30)`.

- **It is its own inverse** — `getReverseTickedTimestamp(rowKey)` maps a stored `rowKey` back to the real timestamp, and vice versa. That's how cursors and the ascending-table mirror are built; never hand-roll the subtraction.
- Never generate a `rowKey` with `Date.now()` or an ISO string — millisecond resolution collides under load, and lexical ISO sorts oldest-first.

## Batch Writes

**Never spend a round trip per entity when the entities share a `partitionKey`** — chunk them into `submitTransaction` instead. This is the Azure-side twin of the drizzle skill's batch-insert rule: a loop of `createEntity`/`updateEntity` awaits is one network latency per row, so an unremarkable 1000-row write becomes 1000 sequential calls on a request a user is waiting on. Partition-per-owner designs (`partitionKey = roomId`, `= programId`) mean the writes usually already qualify — check whether they do before reaching for `Promise.all`, which still issues a request per row.

Paginate at `AZURE_MAX_PAGE_SIZE`, chunk transactions at `AZURE_MAX_BATCH_SIZE`, and let `submitTransactionBatches` (`@esposter/db`) own the chunking — never hand-roll the slice loop. A write needing **per-batch** conflict handling is the one case `submitTransactionBatches` can't serve; it chunks with `chunk` (`@esposter/shared`), still never an index-stepping `for` with `.slice()`.

## Read-Modify-Write Is Conditional

**A server-side read-modify-write over an entity reads through `getEntityWithEtag` and writes conditionally.** Azure Table stores an entity as one blob, so a write that echoes back a field the caller computed from what it read carries the whole version it read. Two of them running at once both compute from the same version, and the later write silently erases the earlier change — no error, no log, and the caller whose write landed first is told it succeeded. This applies to any procedure whose write depends on what it just read.

`getEntity` is the wrong reader here — it exists to **drop** the etag for callers that don't need it. `getEntityWithEtag` returns `{ entity, etag }`, and `updateEntity` forwards its extra arguments to the SDK, so the conditional write is `updateEntity(client, entity, "Merge", { etag })`. Where a shared procedure performs the read (as `getMessageProcedure` does), the etag belongs on the procedure context beside the entity — the round trip is already paid, and every procedure built on it then gets the option.

A rejected conditional write is a `412`, meaning only that the version is stale — the caller's intent is still valid, so re-read and re-apply rather than surfacing it. **`updateEntityConditionally` owns that loop — do not hand-roll it** (`references/conditional-writes.md`).

## Filter Clauses

Build OData filter strings with `serializeClauses` from `@esposter/db`. Clause typing rules (entity type argument, `CompositeKeyPropertyNames`, null-clause inference) belong to the `trpc` skill.

```typescript
const filter = serializeClauses([
  { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: roomId },
  { key: StandardMessageEntityPropertyNames.userId, operator: BinaryOperator.eq, value: userId },
  getTableNullClause(ItemMetadataPropertyNames.deletedAt),
] as Clause<StandardMessageEntity>[]);
```

## Counting — Only After a Capped Read, and Bounded

Azure Table has no count API — `countEntities` (from `@esposter/db`) walks every matching page with a keys-only projection. Two rules keep the walk cheap and honest:

- **Only count when a capped read filled.** A read under its cap answers for itself (`rows.length < cap ? rows.length : await countFooEntities(...)`); only a full page has something to be missing.
- **Bound the walk when the count feeds a display.** Pass `countEntities`'s `maxCount` argument (callers name their own bound). A count that hit the bound is a floor, not a total — every surface must render it as one ("N+", via the shared truncation formatter), never as an exact number.

## Entity Class Constructors

`deserializeEntity` calls `new cls()` with **no arguments**, so every Azure entity constructor must declare `init` optional (`init?:`) and access via optional chaining:

```typescript
export class MyEntity extends AzureEntity {
  myField!: string;

  constructor(init?: Partial<MyEntity> & ToData<CompositeKeyEntity>) {
    super();
    Object.assign(this, init);
    this.myField = init?.myField ?? "default"; // use ?. not just .
  }
}
```

## Soft-Delete

Set `deletedAt` and `updatedAt` together via `serializeEntity`. `getTableNullClause(ItemMetadataPropertyNames.deletedAt)` filters to non-deleted rows only.

```typescript
const now = new Date();
serializeEntity({ deletedAt: now, partitionKey, rowKey, updatedAt: now });
```
