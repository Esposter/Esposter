import type { AzureTable } from "@/models/azure/table/AzureTable";
import type { AzureTableEntityMap } from "@/models/azure/table/AzureTableEntityMap";
import type { CustomTableClient } from "@/models/azure/table/CustomTableClient";

import { TableClient } from "@azure/data-tables";

export const getTableClient = async <TAzureTable extends AzureTable>(
  connectionString: string,
  tableName: TAzureTable,
) => {
  const tableClient = TableClient.fromConnectionString(connectionString, tableName);
  try {
    await tableClient.createTable();
    return tableClient as unknown as CustomTableClient<AzureTableEntityMap[TAzureTable]>;
  } catch {
    return tableClient as unknown as CustomTableClient<AzureTableEntityMap[TAzureTable]>;
  }
};
