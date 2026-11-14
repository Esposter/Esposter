import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareWorkerName from "#src/cloudflare/constants/CloudflareWorkerName";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { devExportUserData } from "#src/cloudflare/resources/queues/devExportUserData";
import { devExportUserDataDeadLetterQueue } from "#src/cloudflare/resources/queues/devExportUserDataDeadLetterQueue";
import * as cloudflare from "@pulumi/cloudflare";

export const devExportUserDataQueueConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  "queueConsumer-dev-export-user-data",
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: devExportUserDataDeadLetterQueue.queueName,
    queueId: devExportUserData.queueId,
    scriptName: CloudflareWorkerName.esposterFunctionsDev,
    settings: QueueConsumerRetry.idempotent,
    type: "worker",
  },
  { parent: devExportUserData, protect: true },
);
