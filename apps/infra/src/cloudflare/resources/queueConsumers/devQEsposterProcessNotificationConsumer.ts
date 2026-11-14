import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareWorkerName from "#src/cloudflare/constants/CloudflareWorkerName";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { devDlqEsposterProcessNotification } from "#src/cloudflare/resources/queues/devDlqEsposterProcessNotification";
import { devQEsposterProcessNotification } from "#src/cloudflare/resources/queues/devQEsposterProcessNotification";
import * as cloudflare from "@pulumi/cloudflare";

export const devQEsposterProcessNotificationConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  "queueConsumer-dev-process-notification",
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: devDlqEsposterProcessNotification.queueName,
    queueId: devQEsposterProcessNotification.queueId,
    scriptName: CloudflareWorkerName.esposterFunctionsDev,
    settings: QueueConsumerRetry.idempotent,
    type: "worker",
  },
  { parent: devQEsposterProcessNotification, protect: true },
);
