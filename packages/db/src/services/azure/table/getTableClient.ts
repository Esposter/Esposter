import type { AzureTable, AzureTableEntityMap, CustomTableClient } from "@esposter/db-schema";

import { TableClient } from "@azure/data-tables";
import { getResultAsync, noop } from "@esposter/shared";

export const getTableClient = async <TAzureTable extends AzureTable>(
  connectionString: string,
  tableName: TAzureTable,
) => {
  const tableClient = TableClient.fromConnectionString(connectionString, tableName);
  await getResultAsync(() => tableClient.createTable()).match(noop, (error) => {
    if ((error as { statusCode?: number }).statusCode !== 409) throw error;
  });
  return tableClient as unknown as CustomTableClient<AzureTableEntityMap[TAzureTable]>;
};
