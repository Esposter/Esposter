import type { AzureTable } from "@esposter/db";

import { getTableClient } from "@esposter/db";

export const useTableClient = <TAzureTable extends AzureTable>(tableName: TAzureTable) => {
  const runtimeConfig = useRuntimeConfig();
  return getTableClient(runtimeConfig.azure.storageAccountConnectionString, tableName);
};
