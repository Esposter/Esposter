import type { useTableClient } from "@@/server/composables/azure/useTableClient";
import type { AzureTable } from "@@/server/models/azure/table/AzureTable";
import type { AzureTableEntityMap } from "@@/server/models/azure/table/AzureTableEntityMap";
import type { CustomTableClient } from "@@/server/models/azure/table/CustomTableClient";

import { MockTableClient } from "@@/server/models/azure/table/MockTableClient";
import { describe } from "vitest";

export const MockTableClientMap = new Map<AzureTable, MockTableClient>();

export const useTableClientMock: typeof useTableClient = (tableName) =>
  new Promise((resolve) => {
    const mockTableClient = MockTableClientMap.get(tableName);
    if (mockTableClient)
      return resolve(mockTableClient as unknown as CustomTableClient<AzureTableEntityMap[typeof tableName]>);

    const newMockTableClient = new MockTableClient("", tableName);
    MockTableClientMap.set(tableName, newMockTableClient);
    return resolve(newMockTableClient as unknown as CustomTableClient<AzureTableEntityMap[typeof tableName]>);
  });

describe.todo("useTableClient");
