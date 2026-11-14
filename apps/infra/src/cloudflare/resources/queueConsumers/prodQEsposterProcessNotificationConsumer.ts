import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareWorkerName from "#src/cloudflare/constants/CloudflareWorkerName";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { prodDlqEsposterProcessNotification } from "#src/cloudflare/resources/queues/prodDlqEsposterProcessNotification";
import { prodQEsposterProcessNotification } from "#src/cloudflare/resources/queues/prodQEsposterProcessNotification";
import * as cloudflare from "@pulumi/cloudflare";

export const prodQEsposterProcessNotificationConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  "queueConsumer-process-notification",
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: prodDlqEsposterProcessNotification.queueName,
    queueId: prodQEsposterProcessNotification.queueId,
    scriptName: CloudflareWorkerName.esposterFunctions,
    settings: QueueConsumerRetry.idempotent,
    type: "worker",
  },
  { parent: prodQEsposterProcessNotification, protect: true },
);
