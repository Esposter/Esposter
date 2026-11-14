import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareWorkerName from "#src/cloudflare/constants/CloudflareWorkerName";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { processBlobDeletion } from "#src/cloudflare/resources/queues/processBlobDeletion";
import { processBlobDeletionDeadLetterQueue } from "#src/cloudflare/resources/queues/processBlobDeletionDeadLetterQueue";
import * as cloudflare from "@pulumi/cloudflare";

export const processBlobDeletionQueueConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  "queueConsumer-process-blob-deletion",
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: processBlobDeletionDeadLetterQueue.queueName,
    queueId: processBlobDeletion.queueId,
    scriptName: CloudflareWorkerName.esposterFunctions,
    settings: QueueConsumerRetry.idempotent,
    type: "worker",
  },
  { parent: processBlobDeletion, protect: true },
);
