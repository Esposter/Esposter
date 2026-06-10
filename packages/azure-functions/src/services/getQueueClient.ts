import type { QueueClient } from "@azure/storage-queue";
import type { AzureQueue } from "@esposter/db-schema";

import { getQueueClient as baseGetQueueClient } from "@esposter/db";

export const getQueueClient = (azureQueue: AzureQueue): QueueClient =>
  baseGetQueueClient(process.env.AZURE_STORAGE_ACCOUNT_CONNECTION_STRING, azureQueue);
