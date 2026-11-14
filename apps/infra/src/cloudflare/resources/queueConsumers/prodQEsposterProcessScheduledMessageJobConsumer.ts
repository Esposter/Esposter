import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareWorkerName from "#src/cloudflare/constants/CloudflareWorkerName";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { prodDlqEsposterProcessScheduledMessageJob } from "#src/cloudflare/resources/queues/prodDlqEsposterProcessScheduledMessageJob";
import { prodQEsposterProcessScheduledMessageJob } from "#src/cloudflare/resources/queues/prodQEsposterProcessScheduledMessageJob";
import * as cloudflare from "@pulumi/cloudflare";

export const prodQEsposterProcessScheduledMessageJobConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  "queueConsumer-process-scheduled-message-job",
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: prodDlqEsposterProcessScheduledMessageJob.queueName,
    queueId: prodQEsposterProcessScheduledMessageJob.queueId,
    scriptName: CloudflareWorkerName.esposterFunctions,
    settings: QueueConsumerRetry.idempotent,
    type: "worker",
  },
  { parent: prodQEsposterProcessScheduledMessageJob, protect: true },
);
