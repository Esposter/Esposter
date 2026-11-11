import type { AzureTable, AzureTableEntityMap, CustomTableClient } from "@esposter/db-schema";

import { createProvisionedClientCache } from "#src/services/azure/createProvisionedClientCache";
import { checkIsConflict } from "#src/services/azure/error/checkIsConflict";
import { TableClient } from "@azure/data-tables";
import { checkIsLocalUrl, getResultAsync, noop } from "@esposter/shared";

const provisionTableClient = async (connectionString: string, tableName: AzureTable) => {
  // The library allows an unencrypted connection only for the literal `UseDevelopmentStorage=true`, so an emulator named
  // By a plaintext endpoint whose parsed host is this machine is allowed explicitly. Judged on the parsed host and not on
  // The text, since `http://localhost@remote.example` begins with a loopback name and connects to the host after the `@`
  const endpoint = /(?:^|;)TableEndpoint=(?<endpoint>[^;]*)/iu.exec(connectionString)?.groups?.endpoint ?? "";
  const tableClient = TableClient.fromConnectionString(connectionString, tableName, {
    allowInsecureConnection: endpoint.startsWith("http://") && checkIsLocalUrl(endpoint),
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
