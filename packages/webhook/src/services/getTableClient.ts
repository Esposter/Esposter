import type { AzureTableEntityMap, CustomTableClient } from "@esposter/db";

import { AzureTable, getTableClient as baseGetTableClient } from "@esposter/db";

export const getTableClient = <TAzureTable extends AzureTable>(
  tableName: TAzureTable,
): Promise<CustomTableClient<AzureTableEntityMap[TAzureTable]>> =>
  baseGetTableClient(process.env.AZURE_STORAGE_CONNECTION_STRING, tableName);
