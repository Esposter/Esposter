import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareWorkerName from "#src/cloudflare/constants/CloudflareWorkerName";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { exportUserData } from "#src/cloudflare/resources/queues/exportUserData";
import { exportUserDataDeadLetterQueue } from "#src/cloudflare/resources/queues/exportUserDataDeadLetterQueue";
import * as cloudflare from "@pulumi/cloudflare";

export const exportUserDataQueueConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  "queueConsumer-export-user-data",
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: exportUserDataDeadLetterQueue.queueName,
    queueId: exportUserData.queueId,
    scriptName: CloudflareWorkerName.esposterFunctions,
    settings: QueueConsumerRetry.idempotent,
    type: "worker",
  },
  { parent: exportUserData, protect: true },
);
