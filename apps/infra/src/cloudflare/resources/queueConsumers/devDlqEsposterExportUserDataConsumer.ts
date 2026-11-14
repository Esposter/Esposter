import DeadLetterConsumerMaxRetries from "#src/cloudflare/constants/DeadLetterConsumerMaxRetries";
import QueueConsumerRetryDelay from "#src/cloudflare/constants/QueueConsumerRetryDelay";
import { devDlqEsposterExportUserData } from "#src/cloudflare/resources/queues/devDlqEsposterExportUserData";
import {
  CLOUDFLARE_ACCOUNT_ID,
  CloudflareAssetType,
  CloudflareEnvironment,
  CloudflareWorkerPurpose,
  getCloudflareResourceName,
  QueueJob,
} from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const deadLetterQueueName = getCloudflareResourceName(
  CloudflareEnvironment.Development,
  CloudflareAssetType.DeadLetterQueue,
  QueueJob.ExportUserData,
);
const scriptName = getCloudflareResourceName(
  CloudflareEnvironment.Development,
  CloudflareAssetType.Worker,
  CloudflareWorkerPurpose.Functions,
);

export const devDlqEsposterExportUserDataConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  `${deadLetterQueueName}-consumer`,
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    queueId: devDlqEsposterExportUserData.queueId,
    scriptName,
    settings: { maxRetries: DeadLetterConsumerMaxRetries, retryDelay: QueueConsumerRetryDelay },
    type: "worker",
  },
  { parent: devDlqEsposterExportUserData, protect: true },
);
