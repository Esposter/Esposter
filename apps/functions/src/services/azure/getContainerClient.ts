import type { ContainerClient } from "@azure/storage-blob";
import type { AzureContainer } from "@esposter/db-schema";

import { getContainerClient as baseGetContainerClient } from "@esposter/db";

export const getContainerClient = (azureContainer: AzureContainer): Promise<ContainerClient> =>
  baseGetContainerClient(process.env.AZURE_STORAGE_ACCOUNT_CONNECTION_STRING, azureContainer);
