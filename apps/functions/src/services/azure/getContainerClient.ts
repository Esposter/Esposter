import type { ContainerClient } from "@azure/storage-blob";
import type { StorageBucket } from "@esposter/db-schema";

import { getContainerClient as baseGetContainerClient } from "@esposter/db";

export const getContainerClient = (storageBucket: StorageBucket): Promise<ContainerClient> =>
  baseGetContainerClient(process.env.AZURE_STORAGE_ACCOUNT_CONNECTION_STRING, storageBucket);
