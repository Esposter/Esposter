# Batched table writes

Read when writing many entities that share a `partitionKey`, or when a batched write's rows can individually conflict. The rule that such writes must be batched at all is in `SKILL.md`.

## `submitTransactionBatches`

`submitTransaction` accepts max 100 actions per call, and all actions in one transaction **must share the same `partitionKey`** (Azure requirement). `submitTransactionBatches` (`@esposter/db`) owns the chunking. Every batch of a page targets the same partition, so it submits them **sequentially**, pacing the writes against that partition's throughput limit — firing them concurrently draws `429`/`TableTransactionFailedError`. Pass `onSubmit` when each batch must be announced as it commits, so a run that stops partway keeps everything it committed:

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

## Batching writes that can conflict

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
