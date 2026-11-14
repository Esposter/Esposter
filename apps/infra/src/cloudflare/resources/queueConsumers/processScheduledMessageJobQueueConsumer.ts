import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareWorkerName from "#src/cloudflare/constants/CloudflareWorkerName";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { processScheduledMessageJob } from "#src/cloudflare/resources/queues/processScheduledMessageJob";
import { processScheduledMessageJobDeadLetterQueue } from "#src/cloudflare/resources/queues/processScheduledMessageJobDeadLetterQueue";
import * as cloudflare from "@pulumi/cloudflare";

export const processScheduledMessageJobQueueConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  "queueConsumer-process-scheduled-message-job",
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: processScheduledMessageJobDeadLetterQueue.queueName,
    queueId: processScheduledMessageJob.queueId,
    scriptName: CloudflareWorkerName.esposterFunctions,
    settings: QueueConsumerRetry.idempotent,
    type: "worker",
  },
  { parent: processScheduledMessageJob, protect: true },
);
