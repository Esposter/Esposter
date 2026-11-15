import ProdJobsWorkerScriptName from "#src/cloudflare/constants/ProdJobsWorkerScriptName";
import QueueConsumerRetryDelay from "#src/cloudflare/constants/QueueConsumerRetryDelay";
import { prodDlqEsposterDeleteOrphanedProfileImage } from "#src/cloudflare/resources/queues/prodDlqEsposterDeleteOrphanedProfileImage";
import { prodQEsposterDeleteOrphanedProfileImage } from "#src/cloudflare/resources/queues/prodQEsposterDeleteOrphanedProfileImage";
import {
  CLOUDFLARE_ACCOUNT_ID,
  CloudflareAssetType,
  CloudflareEnvironment,
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

export const prodQEsposterDeleteOrphanedProfileImageConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  `${queueName}-consumer`,
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    deadLetterQueue: prodDlqEsposterDeleteOrphanedProfileImage.queueName,
    queueId: prodQEsposterDeleteOrphanedProfileImage.queueId,
    scriptName: ProdJobsWorkerScriptName,
    settings: {
      maxRetries: QueueJobMaxRetriesMap[QueueJob.DeleteOrphanedProfileImage],
      retryDelay: QueueConsumerRetryDelay,
    },
    type: "worker",
  },
  { parent: prodQEsposterDeleteOrphanedProfileImage, protect: true },
);
