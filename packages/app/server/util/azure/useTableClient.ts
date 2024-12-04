import type { AzureTable } from "@@/server/models/azure/table/AzureTable";
import type { AzureTableEntityMap } from "@@/server/models/azure/table/AzureTableEntityMap";
import type { CustomTableClient } from "@@/server/models/azure/table/CustomTableClient";

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
