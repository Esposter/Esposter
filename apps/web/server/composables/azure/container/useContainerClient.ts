import type { StorageBucket } from "@esposter/db-schema";

import { getContainerClient } from "@esposter/db";

export const useContainerClient = (storageBucket: StorageBucket) =>
  getContainerClient(process.env.AZURE_STORAGE_ACCOUNT_CONNECTION_STRING, storageBucket);
