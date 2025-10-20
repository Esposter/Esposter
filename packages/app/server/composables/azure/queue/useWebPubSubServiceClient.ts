import type { QueueName } from "@esposter/db-schema";

import { QueueServiceClient } from "@azure/storage-queue";

export const useQueueClient = (queueName: QueueName) => {
  const runtimeConfig = useRuntimeConfig();
  const queueServiceClient = QueueServiceClient.fromConnectionString(
    runtimeConfig.azure.storageAccountConnectionString,
  );
  return queueServiceClient.getQueueClient(queueName);
};
