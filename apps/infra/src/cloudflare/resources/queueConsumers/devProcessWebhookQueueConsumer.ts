import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareWorkerName from "#src/cloudflare/constants/CloudflareWorkerName";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { devProcessWebhook } from "#src/cloudflare/resources/queues/devProcessWebhook";
import { devProcessWebhookDeadLetterQueue } from "#src/cloudflare/resources/queues/devProcessWebhookDeadLetterQueue";
import * as cloudflare from "@pulumi/cloudflare";

export const devProcessWebhookQueueConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  "queueConsumer-dev-process-webhook",
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: devProcessWebhookDeadLetterQueue.queueName,
    queueId: devProcessWebhook.queueId,
    scriptName: CloudflareWorkerName.esposterFunctionsDev,
    settings: QueueConsumerRetry.nonIdempotent,
    type: "worker",
  },
  { parent: devProcessWebhook, protect: true },
);
