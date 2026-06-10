import type { AzureQueue } from "@esposter/db-schema";

import { QueueClient } from "@azure/storage-queue";

export const getQueueClient = (azureQueue: AzureQueue) =>
  QueueClient.fromConnectionString(process.env.AZURE_STORAGE_ACCOUNT_CONNECTION_STRING, azureQueue);
