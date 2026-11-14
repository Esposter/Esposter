import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareWorkerName from "#src/cloudflare/constants/CloudflareWorkerName";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { devDlqEsposterProcessWebhook } from "#src/cloudflare/resources/queues/devDlqEsposterProcessWebhook";
import { devQEsposterProcessWebhook } from "#src/cloudflare/resources/queues/devQEsposterProcessWebhook";
import * as cloudflare from "@pulumi/cloudflare";

export const devQEsposterProcessWebhookConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  "queueConsumer-dev-process-webhook",
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: devDlqEsposterProcessWebhook.queueName,
    queueId: devQEsposterProcessWebhook.queueId,
    scriptName: CloudflareWorkerName.esposterFunctionsDev,
    settings: QueueConsumerRetry.nonIdempotent,
    type: "worker",
  },
  { parent: devQEsposterProcessWebhook, protect: true },
);
