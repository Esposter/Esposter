import type { AzureContainer } from "@esposter/db-schema";

import { getContainerClient } from "@esposter/db";

export const useContainerClient = (azureContainer: AzureContainer) => {
  const runtimeConfig = useRuntimeConfig();
  return getContainerClient(runtimeConfig.azure.storageAccountConnectionString, azureContainer);
};
