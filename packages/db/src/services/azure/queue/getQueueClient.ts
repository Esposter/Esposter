import type { AzureQueue } from "@esposter/db-schema";

import { QueueClient } from "@azure/storage-queue";

export const getQueueClient = (connectionString: string, azureQueue: AzureQueue): QueueClient =>
  new QueueClient(connectionString, azureQueue);
