import type { QueueName } from "@esposter/db-schema";

import { QueueServiceClient } from "@azure/storage-queue";

export const useQueueClient = async (queueName: QueueName) => {
  const runtimeConfig = useRuntimeConfig();
  const queueServiceClient = QueueServiceClient.fromConnectionString(
    runtimeConfig.azure.storageAccountConnectionString,
  );
  const queueClient = queueServiceClient.getQueueClient(queueName);
  await queueClient.createIfNotExists();
  return queueClient;
};
