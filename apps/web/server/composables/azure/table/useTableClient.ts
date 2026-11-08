import type { AzureTable } from "@esposter/db-schema";

import { getTableClient } from "@esposter/db";

export const useTableClient = <TAzureTable extends AzureTable>(tableName: TAzureTable) =>
  getTableClient(process.env.AZURE_STORAGE_ACCOUNT_CONNECTION_STRING, tableName);
