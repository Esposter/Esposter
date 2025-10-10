import type { useTableClient } from "@@/server/composables/azure/useTableClient";
import type { AzureTableEntityMap, CustomTableClient } from "@esposter/db";

import { MockTableClient } from "azure-mock";
import { describe } from "vitest";

export const useTableClientMock: typeof useTableClient = (tableName) =>
  Promise.resolve(
    new MockTableClient("", tableName) as unknown as CustomTableClient<AzureTableEntityMap[typeof tableName]>,
  );

describe.todo("useTableClient");
