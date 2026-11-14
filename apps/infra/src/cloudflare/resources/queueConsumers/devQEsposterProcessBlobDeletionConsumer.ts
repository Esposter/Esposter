import QueueConsumerRetryDelay from "#src/cloudflare/constants/QueueConsumerRetryDelay";
import { devDlqEsposterProcessBlobDeletion } from "#src/cloudflare/resources/queues/devDlqEsposterProcessBlobDeletion";
import { devQEsposterProcessBlobDeletion } from "#src/cloudflare/resources/queues/devQEsposterProcessBlobDeletion";
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
  CloudflareEnvironment.Development,
  CloudflareAssetType.Queue,
  QueueJob.ProcessBlobDeletion,
);
const scriptName = getCloudflareResourceName(
  CloudflareEnvironment.Development,
  CloudflareAssetType.Worker,
  CloudflareWorkerPurpose.Functions,
);

export const devQEsposterProcessBlobDeletionConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  `${queueName}-consumer`,
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    deadLetterQueue: devDlqEsposterProcessBlobDeletion.queueName,
    queueId: devQEsposterProcessBlobDeletion.queueId,
    scriptName,
    settings: { maxRetries: QueueJobMaxRetriesMap[QueueJob.ProcessBlobDeletion], retryDelay: QueueConsumerRetryDelay },
    type: "worker",
  },
  { parent: devQEsposterProcessBlobDeletion, protect: true },
);
