import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import QueueConsumerRetryDelay from "#src/cloudflare/constants/QueueConsumerRetryDelay";
import { prodDlqEsposterDeleteOrphanedProfileImage } from "#src/cloudflare/resources/queues/prodDlqEsposterDeleteOrphanedProfileImage";
import { prodQEsposterDeleteOrphanedProfileImage } from "#src/cloudflare/resources/queues/prodQEsposterDeleteOrphanedProfileImage";
import {
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
  QueueJob.DeleteOrphanedProfileImage,
);
const scriptName = getCloudflareResourceName(
  CloudflareEnvironment.Production,
  CloudflareAssetType.Worker,
  CloudflareWorkerPurpose.Functions,
);

export const prodQEsposterDeleteOrphanedProfileImageConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  `${queueName}-consumer`,
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: prodDlqEsposterDeleteOrphanedProfileImage.queueName,
    queueId: prodQEsposterDeleteOrphanedProfileImage.queueId,
    scriptName,
    settings: {
      maxRetries: QueueJobMaxRetriesMap[QueueJob.DeleteOrphanedProfileImage],
      retryDelay: QueueConsumerRetryDelay,
    },
    type: "worker",
  },
  { parent: prodQEsposterDeleteOrphanedProfileImage, protect: true },
);
