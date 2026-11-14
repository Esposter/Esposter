import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareWorkerName from "#src/cloudflare/constants/CloudflareWorkerName";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { devProcessBlobDeletion } from "#src/cloudflare/resources/queues/devProcessBlobDeletion";
import { devProcessBlobDeletionDeadLetterQueue } from "#src/cloudflare/resources/queues/devProcessBlobDeletionDeadLetterQueue";
import * as cloudflare from "@pulumi/cloudflare";

export const devProcessBlobDeletionQueueConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  "queueConsumer-dev-process-blob-deletion",
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: devProcessBlobDeletionDeadLetterQueue.queueName,
    queueId: devProcessBlobDeletion.queueId,
    scriptName: CloudflareWorkerName.esposterFunctionsDev,
    settings: QueueConsumerRetry.idempotent,
    type: "worker",
  },
  { parent: devProcessBlobDeletion, protect: true },
);
