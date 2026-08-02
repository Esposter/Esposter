---
name: azure-table
description: Esposter Azure Table Storage patterns — key constants, partition/row key design, reverse-ticked timestamps, batch write/pagination, and bounded counting after capped reads. Apply when reading or writing Azure Table Storage data (messages, moderation logs) in server code.
---

# Azure Table Storage Patterns

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

  ```typescript
  rowKey: (getReverseTickedTimestamp(), // newest-first key at write time
    serialize({ rowKey: getReverseTickedTimestamp(lastEventId) }, [MESSAGE_ROWKEY_SORT_ITEM])); // key → cursor
  ```

- Never generate a `rowKey` with `Date.now()` or an ISO string — millisecond resolution collides under load and lexical ISO sorts oldest-first.

## Batch Write Pattern

**Never spend a round trip per entity when the entities share a `partitionKey`** — chunk them into `submitTransaction` instead. This is the Azure-side twin of the drizzle skill's batch-insert rule: a loop of `createEntity`/`updateEntity` awaits is one network latency per row, so an unremarkable 1000-row write becomes 1000 sequential calls on a request a user is waiting on. Partition-per-owner designs (`partitionKey = roomId`, `= programId`) mean the writes usually already qualify — check whether they do before reaching for `Promise.all`, which still issues a request per row.

Paginate at `AZURE_MAX_PAGE_SIZE`, chunk transactions at `AZURE_MAX_BATCH_SIZE`. `submitTransaction` accepts max 100 actions per call, and all actions in one transaction **must share the same `partitionKey`** (Azure requirement).

`submitTransactionBatches` (`@esposter/db`) owns the chunking — never hand-roll the slice loop. Every batch of a page targets the same partition, so it submits them **sequentially**, pacing the writes against that partition's throughput limit — firing them concurrently draws `429`/`TableTransactionFailedError`. Pass `onSubmit` when each batch must be announced as it commits, so a run that stops partway keeps everything it committed:

```typescript
for await (const page of tableClient
  .listEntities<TEntity>({ queryOptions: { filter } })
  .byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE }))
  await submitTransactionBatches(
    tableClient,
    page,
    ({ partitionKey, rowKey }) => ["update", serializeEntity({ ...fields, partitionKey, rowKey })],
    (batch) => {
      for (const { partitionKey, rowKey } of batch) messageEventEmitter.emit("deleteMessage", { partitionKey, rowKey });
    },
  );
```

## Batching Writes That Can Conflict

A transaction is **all-or-nothing**: one rejected action (a `create` whose row already exists → `409`) rolls the whole batch back, and the error names no row you can trust to attribute. So a write that needs per-row conflict handling batches optimistically and replays the batch one insert at a time only when the batch is rejected — the fast path costs one call per 100 rows, and only a genuine collision pays the per-row cost:

```typescript
const isBatchCreated = await getResultAsync(() =>
  tableClient.submitTransaction(batch.map((entity) => ["create", serializeEntity(entity)])),
).match(
  () => true,
  (error) => {
    if (getIsConflict(error)) return false;
    throw error;
  },
);
// isBatchCreated === false → replay `batch` insert by insert, applying the per-row 409 handling there
```

Only a `409` may fall back — any other failure is a real fault and must propagate, or a transient error silently degrades into a per-row storm that fails anyway. `getIsConflict` and `serializeEntity` both come from `@esposter/db` — never re-test `statusCode === 409` inline (`getIsConflict` covers a blob's conditional create too). `submitTransaction` takes raw entities, so unlike `createEntity` it does not serialize for you.

`MockTableClient.submitTransaction` applies its actions **synchronously** precisely so this is testable: awaiting between actions would let a concurrent caller interleave writes that the rollback then drops. Trust it to model atomicity faithfully under `Promise.all` in tests.

## Read-Modify-Write Is Conditional

**A server-side read-modify-write over an entity reads through `getEntityWithEtag` and writes conditionally.** Azure Table stores an entity as one blob, so a write that echoes back a field the caller computed from what it read carries the whole version it read. Two of them running at once both compute from the same version, and the later write silently erases the earlier change — no error, no log, and the caller whose write landed first is told it succeeded. This applies to any procedure whose write depends on what it just read: a votes map, a `files` array a delete splices, or any `"Replace"` of a full entity.

`getEntity` is the wrong reader here — it exists to **drop** the etag for callers that don't need it. `getEntityWithEtag` returns `{ entity, etag }`, and `updateEntity` forwards its extra arguments to the SDK, so the conditional write is `updateEntity(client, entity, "Merge", { etag })`. Where a shared procedure performs the read (as `getMessageProcedure` does), the etag belongs on the procedure context beside the entity — the round trip is already paid, and every procedure built on it then gets the option.

A rejected conditional write is a `412`, and it means only that the version is stale — the caller's own intent is still valid. So re-read and re-apply rather than surfacing it. **`updateEntityConditionally` owns that loop — do not hand-roll it.** A caller supplies `getUpdateEntity` and `writeEntity`, and the helper does the rest:

- **Re-apply the intent to the version it re-read, never the body it started from.** This is what `getUpdateEntity(entity)` is for: it receives the fresh entity on every attempt. "Clear this field", "drop this file", "record this vote" all survive losing a race; the body computed against the version that moved does not. Replaying that body **is** the bug — for a `"Replace"` it reverts every concurrent change to the entity, not just the field the caller meant to touch.
- **A `"Replace"` is not exempt, it is the reason.** Merge cannot unset a property, so clearing one (`deleteLinkPreviewResponse`, `unpinMessage`) has to write the whole body — which is exactly the write that silently reverts a concurrent edit when it is unconditional.
- **Emit the delta, not the replaced body.** The subscription payload stays `{ clearedField, partitionKey, rowKey }` so a client merges one property instead of adopting a whole entity it may hold newer state for.
- **Bounded retries.** `MAX_ENTITY_ETAG_RETRIES` in the helper — never until it lands, or one hot row spins a request a user is waiting on.
- **Exhaustion is a real outcome, and the call decides which.** Fire-and-forget telemetry drops it (`incrementResourceViewCount`, which keeps its own loop); anything a user is waiting on gets the helper's `CONFLICT` so they can retry, rather than returning success over a change that never landed.
- **Only a lost race retries.** Re-read after a failed write: a version that moved is the concurrent writer, an unchanged version means the write failed for something a retry cannot fix, so that error propagates as itself. Without that split a transient fault degrades into `CONFLICT` after N attempts and names the wrong cause.

Anything derived from the version that won has to be read out of the attempt that wrote it, not the one the procedure started with — `deleteFile` captures the removed file's `filename` inside `getUpdateEntity` so the blobs it publishes for deletion belong to the file it actually removed.

`MockTableClient` honours the condition (`#applyUpdate` throws a `412` `MockRestError` when the passed etag doesn't match the stored one, `"*"` being the wildcard), and re-etags on every write, so the whole loop is testable. What it does **not** reproduce is the interleaving: every mock client resolves in the same microtask drain, so two concurrent procedures run to completion one after the other and a bare `Promise.all` over them passes against the unconditional bug. Force the overlap by holding the first write open (see below) — never conclude from a green `Promise.all` that concurrency is covered.

## Intercepting a Write in a Test

`useTableClient` builds a fresh client per call (`getTableClient` → `TableClient.fromConnectionString`, plus an idempotent `createTable`), so a `vi.spyOn` on a client the test obtained never sees the write the code under test performs. Read the written entities back through `listEntities` against `MockTableDatabase` — the default, since it exercises the real serialization — and mock the **composable** only when the test needs to control the write's timing rather than its result:

```typescript
// The factory is hoisted above file scope, so the holder it reads is declared through vi.hoisted
const { tableClientMock } = vi.hoisted(() => ({
  tableClientMock: {} as { current: { createEntity: (entity: Record<string, unknown>) => Promise<void> } },
}));

// The composable is generic over the table, so the stub answers with the caller's entity type
vi.mock(import("@@/server/composables/azure/table/useTableClient"), () => ({
  useTableClient: <TAzureTable extends AzureTable>() =>
    Promise.resolve(tableClientMock.current as unknown as CustomTableClient<AzureTableEntityMap[TAzureTable]>),
}));
```

Each test assigns `tableClientMock.current` in its body, so the stub carries only what that test observes.

## Testing Pagination Boundaries

Use `AZURE_MAX_PAGE_SIZE + 1` records to cross a page boundary:

```typescript
const messageCount = AZURE_MAX_PAGE_SIZE + 1;
for (let i = 0; i < messageCount; i++) {
  await mockSessionOnce(db, user);
  await caller.createMessage({ message: " ", roomId });
}
```

Inspect raw table state with `MockTableDatabase`:

```typescript
import { MockTableDatabase } from "azure-mock";
import { AzureTable } from "@esposter/db-schema";

const allEntities = [...(MockTableDatabase.get(AzureTable.Messages)?.values() ?? [])] as TEntity[];
```

## Filter Clauses

Build OData filter strings with `serializeClauses` from `@esposter/db`:

```typescript
import { getTableNullClause, serializeClauses } from "@esposter/db";

const filter = serializeClauses([
  { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: roomId },
  { key: StandardMessageEntityPropertyNames.userId, operator: BinaryOperator.eq, value: userId },
  getTableNullClause(ItemMetadataPropertyNames.deletedAt),
] as Clause<StandardMessageEntity>[]);
```

## Counting — Only After a Capped Read, and Bounded

Azure Table has no count API — `countEntities` (from `@esposter/db`) walks every matching page with a keys-only projection. Two rules keep the walk cheap and honest:

- **Only count when a capped read filled.** A read under its cap answers for itself (`rows.length < cap ? rows.length : await countFooEntities(...)`); only a full page has something to be missing.
- **Bound the walk when the count feeds a display.** Pass `countEntities`'s `maxCount` argument (callers name their bound, e.g. `DATASET_MAX_COUNTED_ROWS`). A count that hit the bound is a floor, not a total — every surface must render it as one ("N+", via the shared truncation formatter), never as an exact number.

## Entity Class Constructors

`deserializeEntity` calls `new cls()` with **no arguments**, so every Azure entity constructor must declare `init` optional (`init?:`) and access via optional chaining (`init?.foo`):

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
