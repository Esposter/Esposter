import type { useTableClient } from "@@/server/composables/azure/useTableClient";
import type { AzureTableEntityMap } from "@@/server/models/azure/table/AzureTableEntityMap";
import type { CustomTableClient } from "@@/server/models/azure/table/CustomTableClient";

import { MockTableClient } from "azure-mock";
import { describe } from "vitest";

export const useTableClientMock: typeof useTableClient = (tableName) =>
  Promise.resolve(
    new MockTableClient("", tableName) as unknown as CustomTableClient<AzureTableEntityMap[typeof tableName]>,
  );

describe.todo("useTableClient");
