import type { AzureTable, AzureTableEntityMap, CustomTableClient } from "@esposter/db-schema";

import { MockTableClient } from "azure-mock";
import { describe } from "vitest";

export const getTableClient = <T extends AzureTable>(
  tableName: T,
): Promise<CustomTableClient<AzureTableEntityMap[T]>> =>
  Promise.resolve(
    new MockTableClient<AzureTableEntityMap[T]>("", tableName) as unknown as CustomTableClient<AzureTableEntityMap[T]>,
  );

describe.todo("getTableClient");
