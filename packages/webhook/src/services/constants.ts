import type { StorageQueueOutput } from "@azure/functions";

export const WEBHOOK_STORAGE_QUEUE_OUTPUT: StorageQueueOutput = {
  connection: "AzureWebJobsStorage",
  name: "queueMessage",
  queueName: "webhook-jobs",
  type: "queue",
};
