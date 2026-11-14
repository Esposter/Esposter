import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareWorkerName from "#src/cloudflare/constants/CloudflareWorkerName";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { devDlqEsposterProcessScheduledMessageJob } from "#src/cloudflare/resources/queues/devDlqEsposterProcessScheduledMessageJob";
import { devQEsposterProcessScheduledMessageJob } from "#src/cloudflare/resources/queues/devQEsposterProcessScheduledMessageJob";
import * as cloudflare from "@pulumi/cloudflare";

export const devQEsposterProcessScheduledMessageJobConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  "queueConsumer-dev-process-scheduled-message-job",
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: devDlqEsposterProcessScheduledMessageJob.queueName,
    queueId: devQEsposterProcessScheduledMessageJob.queueId,
    scriptName: CloudflareWorkerName.esposterFunctionsDev,
    settings: QueueConsumerRetry.idempotent,
    type: "worker",
  },
  { parent: devQEsposterProcessScheduledMessageJob, protect: true },
);
