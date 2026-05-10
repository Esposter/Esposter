# Azure Table Storage Patterns

## Key Constants (from `@esposter/db-schema`)

| Constant               | Value | When to use                                                         |
| ---------------------- | ----- | ------------------------------------------------------------------- |
| `AZURE_MAX_PAGE_SIZE`  | 1000  | `byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE })` for listing entities |
| `AZURE_MAX_BATCH_SIZE` | 100   | Chunk size for `submitTransaction` — Azure hard limit per call      |

Always import from `@esposter/db-schema`, never redefine locally.

## Pagination Pattern

```typescript
for await (const page of tableClient
  .listEntities<TEntity>({ queryOptions: { filter } })
  .byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE })) {
  // process page
}
```

## Batch Write Pattern

When updating/deleting many entities, paginate at `AZURE_MAX_PAGE_SIZE` and chunk transactions at `AZURE_MAX_BATCH_SIZE`:

```typescript
for await (const page of tableClient
  .listEntities<TEntity>({ queryOptions: { filter } })
  .byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE })) {
  for (let i = 0; i < page.length; i += AZURE_MAX_BATCH_SIZE) {
    const batch = page.slice(i, i + AZURE_MAX_BATCH_SIZE);
    await tableClient.submitTransaction(
      batch.map(({ partitionKey, rowKey }) => ["update", serializeEntity({ ...fields, partitionKey, rowKey })]),
    );
  }
}
```

Why two loops: Azure Table pages hold up to 1000 entities but `submitTransaction` accepts max 100 actions per call. All actions in a single transaction **must share the same `partitionKey`** (Azure requirement).

## Testing Pagination Boundaries

Use `AZURE_MAX_PAGE_SIZE + 1` records to cross a page boundary:

```typescript
const messageCount = AZURE_MAX_PAGE_SIZE + 1;
for (let i = 0; i < messageCount; i++) {
  await mockSessionOnce(db, user);
  await caller.createMessage({ message: " ", roomId });
}
// then verify all are affected
```

Use `MockTableDatabase` to inspect raw table state after operations:

```typescript
import { MockTableDatabase } from "azure-mock";
import { AzureTable } from "@esposter/db-schema";

const allEntities = [...(MockTableDatabase.get(AzureTable.Messages)?.values() ?? [])] as TEntity[];
```

## Filter Clauses

Use `serializeClauses` from `@esposter/db` to build Azure Table OData filter strings:

```typescript
import { getTableNullClause, serializeClauses } from "@esposter/db";

const filter = serializeClauses([
  { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: roomId },
  { key: StandardMessageEntityPropertyNames.userId, operator: BinaryOperator.eq, value: userId },
  getTableNullClause(ItemMetadataPropertyNames.deletedAt),
] as Clause<StandardMessageEntity>[]);
```

## Soft-Delete

Set `deletedAt` and `updatedAt` together via `serializeEntity`:

```typescript
const now = new Date();
serializeEntity({ deletedAt: now, partitionKey, rowKey, updatedAt: now });
```

`getTableNullClause(ItemMetadataPropertyNames.deletedAt)` filters to non-deleted rows only.
