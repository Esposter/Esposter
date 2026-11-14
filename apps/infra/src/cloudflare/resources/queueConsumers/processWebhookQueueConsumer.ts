import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareWorkerName from "#src/cloudflare/constants/CloudflareWorkerName";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { processWebhook } from "#src/cloudflare/resources/queues/processWebhook";
import { processWebhookDeadLetterQueue } from "#src/cloudflare/resources/queues/processWebhookDeadLetterQueue";
import * as cloudflare from "@pulumi/cloudflare";

export const processWebhookQueueConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  "queueConsumer-process-webhook",
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: processWebhookDeadLetterQueue.queueName,
    queueId: processWebhook.queueId,
    scriptName: CloudflareWorkerName.esposterFunctions,
    settings: QueueConsumerRetry.nonIdempotent,
    type: "worker",
  },
  { parent: processWebhook, protect: true },
);
