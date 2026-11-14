import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareWorkerName from "#src/cloudflare/constants/CloudflareWorkerName";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { devProcessScheduledMessageJob } from "#src/cloudflare/resources/queues/devProcessScheduledMessageJob";
import { devProcessScheduledMessageJobDeadLetterQueue } from "#src/cloudflare/resources/queues/devProcessScheduledMessageJobDeadLetterQueue";
import * as cloudflare from "@pulumi/cloudflare";

export const devProcessScheduledMessageJobQueueConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  "queueConsumer-dev-process-scheduled-message-job",
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: devProcessScheduledMessageJobDeadLetterQueue.queueName,
    queueId: devProcessScheduledMessageJob.queueId,
    scriptName: CloudflareWorkerName.esposterFunctionsDev,
    settings: QueueConsumerRetry.idempotent,
    type: "worker",
  },
  { parent: devProcessScheduledMessageJob, protect: true },
);
