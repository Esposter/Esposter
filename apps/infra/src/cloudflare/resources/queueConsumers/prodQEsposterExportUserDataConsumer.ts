import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareWorkerName from "#src/cloudflare/constants/CloudflareWorkerName";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { prodDlqEsposterExportUserData } from "#src/cloudflare/resources/queues/prodDlqEsposterExportUserData";
import { prodQEsposterExportUserData } from "#src/cloudflare/resources/queues/prodQEsposterExportUserData";
import * as cloudflare from "@pulumi/cloudflare";

export const prodQEsposterExportUserDataConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  "queueConsumer-export-user-data",
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: prodDlqEsposterExportUserData.queueName,
    queueId: prodQEsposterExportUserData.queueId,
    scriptName: CloudflareWorkerName.esposterFunctions,
    settings: QueueConsumerRetry.idempotent,
    type: "worker",
  },
  { parent: prodQEsposterExportUserData, protect: true },
);
