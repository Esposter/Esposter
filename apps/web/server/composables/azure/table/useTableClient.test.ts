import type { AzureTable, AzureTableEntityMap, CustomTableClient } from "@esposter/db-schema";

import { MockTableClient } from "azure-mock";
import { describe } from "vitest";

export const useTableClient = <TAzureTable extends AzureTable>(
  tableName: TAzureTable,
): Promise<CustomTableClient<AzureTableEntityMap[TAzureTable]>> =>
  Promise.resolve(new MockTableClient("", tableName) as unknown as CustomTableClient<AzureTableEntityMap[TAzureTable]>);

describe.todo("useTableClient");
