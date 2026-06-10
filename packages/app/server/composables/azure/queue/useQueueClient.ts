import type { AzureQueue } from "@esposter/db-schema";

import { getQueueClient } from "@esposter/db";

export const useQueueClient = (azureQueue: AzureQueue) => {
  const runtimeConfig = useRuntimeConfig();
  return getQueueClient(runtimeConfig.azure.storageAccountConnectionString, azureQueue);
};
