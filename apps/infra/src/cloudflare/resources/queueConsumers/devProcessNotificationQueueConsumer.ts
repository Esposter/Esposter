import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareWorkerName from "#src/cloudflare/constants/CloudflareWorkerName";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { devProcessNotification } from "#src/cloudflare/resources/queues/devProcessNotification";
import { devProcessNotificationDeadLetterQueue } from "#src/cloudflare/resources/queues/devProcessNotificationDeadLetterQueue";
import * as cloudflare from "@pulumi/cloudflare";

export const devProcessNotificationQueueConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  "queueConsumer-dev-process-notification",
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: devProcessNotificationDeadLetterQueue.queueName,
    queueId: devProcessNotification.queueId,
    scriptName: CloudflareWorkerName.esposterFunctionsDev,
    settings: QueueConsumerRetry.idempotent,
    type: "worker",
  },
  { parent: devProcessNotification, protect: true },
);
