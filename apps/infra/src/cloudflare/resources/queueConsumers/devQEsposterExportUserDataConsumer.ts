import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareWorkerName from "#src/cloudflare/constants/CloudflareWorkerName";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { devDlqEsposterExportUserData } from "#src/cloudflare/resources/queues/devDlqEsposterExportUserData";
import { devQEsposterExportUserData } from "#src/cloudflare/resources/queues/devQEsposterExportUserData";
import * as cloudflare from "@pulumi/cloudflare";

export const devQEsposterExportUserDataConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  "queueConsumer-dev-export-user-data",
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: devDlqEsposterExportUserData.queueName,
    queueId: devQEsposterExportUserData.queueId,
    scriptName: CloudflareWorkerName.esposterFunctionsDev,
    settings: QueueConsumerRetry.idempotent,
    type: "worker",
  },
  { parent: devQEsposterExportUserData, protect: true },
);
