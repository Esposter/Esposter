import type { AzureContainer } from "@esposter/db-schema";

import { getContainerClient } from "@esposter/db";
import { useRuntimeConfig } from "nuxt/app";

export const useContainerClient = (azureContainer: AzureContainer) => {
  const runtimeConfig = useRuntimeConfig();
  return getContainerClient(runtimeConfig.azure.storageAccountConnectionString, azureContainer);
};
