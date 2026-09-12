import type { AzureTable, AzureTableEntityMap, CustomTableClient } from "@esposter/db-schema";

import { checkIsConflict } from "#src/services/azure/table/checkIsConflict";
import { createProvisionedClientCache } from "#src/services/azure/createProvisionedClientCache";
import { TableClient } from "@azure/data-tables";
import { getResultAsync, noop } from "@esposter/shared";

const provisionTableClient = async (connectionString: string, tableName: AzureTable) => {
  const tableClient = TableClient.fromConnectionString(connectionString, tableName);
  await getResultAsync(() => tableClient.createTable()).match(noop, (error) => {
    if (!checkIsConflict(error)) throw error;
  });
  return tableClient;
};

const getProvisionedTableClient = createProvisionedClientCache(provisionTableClient);
// The entity type is the caller's, so the cache stores one erased client per table and the type argument is
// Reapplied here — the same cast the uncached form carried
export const getTableClient = <TAzureTable extends AzureTable>(
  connectionString: string,
  tableName: TAzureTable,
): Promise<CustomTableClient<AzureTableEntityMap[TAzureTable]>> =>
  getProvisionedTableClient(connectionString, tableName) as Promise<
    CustomTableClient<AzureTableEntityMap[TAzureTable]>
  >;
