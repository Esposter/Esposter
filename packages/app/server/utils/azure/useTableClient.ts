import type { AzureTable, AzureTableEntityMap, CustomTableClient } from "@/models/azure/table";

import { TableClient } from "@azure/data-tables";

export const useTableClient = async <TAzureTable extends AzureTable>(
  tableName: TAzureTable,
): Promise<CustomTableClient<AzureTableEntityMap[TAzureTable]>> => {
  const runtimeConfig = useRuntimeConfig();
  const tableClient = TableClient.fromConnectionString(runtimeConfig.azure.storageAccountConnectionString, tableName);
  try {
    await tableClient.createTable();
    return tableClient as CustomTableClient<AzureTableEntityMap[TAzureTable]>;
  } catch {
    return tableClient as CustomTableClient<AzureTableEntityMap[TAzureTable]>;
  }
};
