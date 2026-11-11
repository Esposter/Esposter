import type { AzureTable, AzureTableEntityMap, CustomTableClient } from "@esposter/db-schema";

import { createProvisionedClientCache } from "#src/services/azure/createProvisionedClientCache";
import { checkIsConflict } from "#src/services/azure/error/checkIsConflict";
import { TableClient } from "@azure/data-tables";
import { getResultAsync, noop } from "@esposter/shared";

const provisionTableClient = async (connectionString: string, tableName: AzureTable) => {
  // The library allows an unencrypted connection only for the literal `UseDevelopmentStorage=true`, so an emulator named
  // By a loopback http endpoint, on a port of its own, is allowed explicitly. A plaintext endpoint on any other host is
  // A production table, which stays refused
  const tableClient = TableClient.fromConnectionString(connectionString, tableName, {
    allowInsecureConnection: /TableEndpoint=http:\/\/(?:127\.0\.0\.1|localhost|\[::1\])(?:[:/;]|$)/iu.test(
      connectionString,
    ),
  });
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
