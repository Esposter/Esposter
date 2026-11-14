import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareWorkerName from "#src/cloudflare/constants/CloudflareWorkerName";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { prodDlqEsposterProcessBlobDeletion } from "#src/cloudflare/resources/queues/prodDlqEsposterProcessBlobDeletion";
import { prodQEsposterProcessBlobDeletion } from "#src/cloudflare/resources/queues/prodQEsposterProcessBlobDeletion";
import * as cloudflare from "@pulumi/cloudflare";

export const prodQEsposterProcessBlobDeletionConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  "queueConsumer-process-blob-deletion",
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: prodDlqEsposterProcessBlobDeletion.queueName,
    queueId: prodQEsposterProcessBlobDeletion.queueId,
    scriptName: CloudflareWorkerName.esposterFunctions,
    settings: QueueConsumerRetry.idempotent,
    type: "worker",
  },
  { parent: prodQEsposterProcessBlobDeletion, protect: true },
);
