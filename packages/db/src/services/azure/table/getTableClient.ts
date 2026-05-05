import type { AzureTable, AzureTableEntityMap, CustomTableClient } from "@esposter/db-schema";

import { TableClient } from "@azure/data-tables";
import { toAppError } from "@esposter/shared";
import { ResultAsync } from "neverthrow";

export const getTableClient = async <TAzureTable extends AzureTable>(
  connectionString: string,
  tableName: TAzureTable,
) => {
  const tableClient = TableClient.fromConnectionString(connectionString, tableName);
  const result = await ResultAsync.fromPromise(tableClient.createTable(), toAppError);
  if (result.isErr() && (result.error as { statusCode?: number }).statusCode !== 409) throw result.error;
  return tableClient as unknown as CustomTableClient<AzureTableEntityMap[TAzureTable]>;
};
