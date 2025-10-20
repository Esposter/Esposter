import type { StorageQueueOutput } from "@azure/functions";

import { QueueName } from "@esposter/db-schema";

export const WEBHOOK_STORAGE_QUEUE_OUTPUT: StorageQueueOutput = {
  connection: "AzureWebJobsStorage",
  name: "queueMessage",
  queueName: QueueName.WebhookJobs,
  type: "queue",
};

export const PUSH_NOTIFICATION_STORAGE_QUEUE_OUTPUT: StorageQueueOutput = {
  connection: "AzureWebJobsStorage",
  name: "pushNotification",
  queueName: QueueName.PushNotifications,
  type: "queue",
};
