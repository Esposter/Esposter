import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareWorkerName from "#src/cloudflare/constants/CloudflareWorkerName";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { processNotification } from "#src/cloudflare/resources/queues/processNotification";
import { processNotificationDeadLetterQueue } from "#src/cloudflare/resources/queues/processNotificationDeadLetterQueue";
import * as cloudflare from "@pulumi/cloudflare";

export const processNotificationQueueConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  "queueConsumer-process-notification",
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: processNotificationDeadLetterQueue.queueName,
    queueId: processNotification.queueId,
    scriptName: CloudflareWorkerName.esposterFunctions,
    settings: QueueConsumerRetry.idempotent,
    type: "worker",
  },
  { parent: processNotification, protect: true },
);
