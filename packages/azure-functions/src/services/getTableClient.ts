import type { AzureTable, AzureTableEntityMap, CustomTableClient } from "@esposter/db-schema";

import { getTableClient as baseGetTableClient } from "@esposter/db";

export const getTableClient = <TAzureTable extends AzureTable>(
  tableName: TAzureTable,
): Promise<CustomTableClient<AzureTableEntityMap[TAzureTable]>> =>
  baseGetTableClient(process.env.AZURE_STORAGE_CONNECTION_STRING, tableName);
