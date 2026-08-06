# Observing table writes in tests

Read when a test must observe, intercept or time a table write, or cross a page boundary.

## Intercepting a write

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

Each test assigns `tableClientMock.current` in its body, so the stub carries only what that test observes. Holding that promise open is also how a test forces two conditional writes to genuinely overlap.

## Inspecting raw table state

```typescript
import { MockTableDatabase } from "azure-mock";
import { AzureTable } from "@esposter/db-schema";

const allEntities = [...(MockTableDatabase.get(AzureTable.Messages)?.values() ?? [])] as TEntity[];
```

## Pagination boundaries

Use `AZURE_MAX_PAGE_SIZE + 1` records to cross a page boundary:

```typescript
const messageCount = AZURE_MAX_PAGE_SIZE + 1;
for (let i = 0; i < messageCount; i++) {
  await mockSessionOnce(db, user);
  await caller.createMessage({ message: " ", roomId });
}
```
