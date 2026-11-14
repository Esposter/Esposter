import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareWorkerName from "#src/cloudflare/constants/CloudflareWorkerName";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { prodDlqEsposterProcessWebhook } from "#src/cloudflare/resources/queues/prodDlqEsposterProcessWebhook";
import { prodQEsposterProcessWebhook } from "#src/cloudflare/resources/queues/prodQEsposterProcessWebhook";
import * as cloudflare from "@pulumi/cloudflare";

export const prodQEsposterProcessWebhookConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  "queueConsumer-process-webhook",
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: prodDlqEsposterProcessWebhook.queueName,
    queueId: prodQEsposterProcessWebhook.queueId,
    scriptName: CloudflareWorkerName.esposterFunctions,
    settings: QueueConsumerRetry.nonIdempotent,
    type: "worker",
  },
  { parent: prodQEsposterProcessWebhook, protect: true },
);
