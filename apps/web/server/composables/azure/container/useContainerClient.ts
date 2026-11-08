import type { AzureContainer } from "@esposter/db-schema";

import { getContainerClient } from "@esposter/db";

export const useContainerClient = (azureContainer: AzureContainer) => {
  return getContainerClient(process.env.AZURE_STORAGE_ACCOUNT_CONNECTION_STRING, azureContainer);
};
