import type { AzureTable } from "@esposter/db-schema";

import { getTableClient } from "@esposter/db";
import { useRuntimeConfig } from "nuxt/app";

export const useTableClient = <TAzureTable extends AzureTable>(tableName: TAzureTable) => {
  const runtimeConfig = useRuntimeConfig();
  return getTableClient(runtimeConfig.azure.storageAccountConnectionString, tableName);
};
