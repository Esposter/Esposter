import type { AzureContainer } from "@esposter/db";

import { getContainerClient } from "@esposter/db";

export const useContainerClient = (azureContainer: AzureContainer) => {
  const runtimeConfig = useRuntimeConfig();
  return getContainerClient(runtimeConfig.azure.storageAccountConnectionString, azureContainer);
};
