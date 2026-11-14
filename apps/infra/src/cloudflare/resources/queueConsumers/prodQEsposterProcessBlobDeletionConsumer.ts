import QueueConsumerRetryDelay from "#src/cloudflare/constants/QueueConsumerRetryDelay";
import { prodDlqEsposterProcessBlobDeletion } from "#src/cloudflare/resources/queues/prodDlqEsposterProcessBlobDeletion";
import { prodQEsposterProcessBlobDeletion } from "#src/cloudflare/resources/queues/prodQEsposterProcessBlobDeletion";
import {
  CLOUDFLARE_ACCOUNT_ID,
  CloudflareAssetType,
  CloudflareEnvironment,
  CloudflareWorkerPurpose,
  getCloudflareResourceName,
  QueueJob,
  QueueJobMaxRetriesMap,
} from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const queueName = getCloudflareResourceName(
  CloudflareEnvironment.Production,
  CloudflareAssetType.Queue,
  QueueJob.ProcessBlobDeletion,
);
const scriptName = getCloudflareResourceName(
  CloudflareEnvironment.Production,
  CloudflareAssetType.Worker,
  CloudflareWorkerPurpose.Functions,
);

export const prodQEsposterProcessBlobDeletionConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  `${queueName}-consumer`,
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    deadLetterQueue: prodDlqEsposterProcessBlobDeletion.queueName,
    queueId: prodQEsposterProcessBlobDeletion.queueId,
    scriptName,
    settings: { maxRetries: QueueJobMaxRetriesMap[QueueJob.ProcessBlobDeletion], retryDelay: QueueConsumerRetryDelay },
    type: "worker",
  },
  { parent: prodQEsposterProcessBlobDeletion, protect: true },
);
