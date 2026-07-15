---
name: azure-table
description: Esposter Azure Table Storage patterns — key constants, partition/row key design, reverse-ticked timestamps, and batch write/pagination. Apply when reading or writing Azure Table Storage data (messages, moderation logs) in server code.
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

Paginate at `AZURE_MAX_PAGE_SIZE`, chunk transactions at `AZURE_MAX_BATCH_SIZE`. `submitTransaction` accepts max 100 actions per call, and all actions in one transaction **must share the same `partitionKey`** (Azure requirement).

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
