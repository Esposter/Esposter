import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import QueueConsumerRetryDelay from "#src/cloudflare/constants/QueueConsumerRetryDelay";
import { devDlqEsposterDeleteOrphanedProfileImage } from "#src/cloudflare/resources/queues/devDlqEsposterDeleteOrphanedProfileImage";
import { devQEsposterDeleteOrphanedProfileImage } from "#src/cloudflare/resources/queues/devQEsposterDeleteOrphanedProfileImage";
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
  CloudflareEnvironment.Development,
  CloudflareAssetType.Queue,
  QueueJob.DeleteOrphanedProfileImage,
);
const scriptName = getCloudflareResourceName(
  CloudflareEnvironment.Development,
  CloudflareAssetType.Worker,
  CloudflareWorkerPurpose.Functions,
);

export const devQEsposterDeleteOrphanedProfileImageConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  `${queueName}-consumer`,
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: devDlqEsposterDeleteOrphanedProfileImage.queueName,
    queueId: devQEsposterDeleteOrphanedProfileImage.queueId,
    scriptName,
    settings: {
      maxRetries: QueueJobMaxRetriesMap[QueueJob.DeleteOrphanedProfileImage],
      retryDelay: QueueConsumerRetryDelay,
    },
    type: "worker",
  },
  { parent: devQEsposterDeleteOrphanedProfileImage, protect: true },
);
