import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { AzureTable, AzureTableEntityMap, CustomTableClient } from "@esposter/db-schema";

import { createResourceRow } from "@@/server/services/resource/createResourceRow";
import { ResourceActivityType, ResourceType } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";

const { tableClientMock } = vi.hoisted(() => ({
  tableClientMock: {} as { current: { createEntity: (entity: Record<string, unknown>) => Promise<void> } },
}));

// The client is created per call, so a spy on one instance never sees the write — the composable is the only seam
vi.mock(import("@@/server/composables/azure/table/useTableClient"), () => ({
  useTableClient: <TAzureTable extends AzureTable>() =>
    Promise.resolve(tableClientMock.current as unknown as CustomTableClient<AzureTableEntityMap[TAzureTable]>),
}));

describe(createResourceRow, () => {
  const name = "name";
  const resourceId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const createContext = () =>
    ({
      db: {
        insert: () => ({ values: () => ({ returning: () => Promise.resolve([{ id: resourceId, name, userId }]) }) }),
      },
      getSessionPayload: { user: { id: userId } },
    }) as unknown as AuthedContext;

  // The row is handed back only once its trail entry is durable, so the compensating cleanup a caller rolls back
  // Through cannot outrun the write — an entry landing after that cleanup deleted the partition would resurrect
  // Itself as an orphan, unreachable once the row gating the read is gone
  test("does not return the row until its activity entry is durable", async () => {
    expect.hasAssertions();

    const entities: Record<string, unknown>[] = [];
    const { promise: writePromise, resolve: releaseWrite } = Promise.withResolvers<void>();
    tableClientMock.current = {
      createEntity: (entity) => {
        entities.push(entity);
        return writePromise;
      },
    };
    let isReturned = false;
    const promise = (async () => {
      const resource = await createResourceRow(createContext(), { name, type: ResourceType.Sheet });
      isReturned = true;
      return resource;
    })();
    // A timer boundary drains every pending microtask, so anything still unsettled is waiting on the gated write
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    const entity = takeOne(entities);

    expect(entity.activityType).toBe(ResourceActivityType.Created);
    expect(entity.partitionKey).toBe(resourceId);
    expect(entity.userId).toBe(userId);
    expect(isReturned).toBe(false);

    releaseWrite();

    await expect(promise.then(({ id }) => id)).resolves.toBe(resourceId);
  });
});
