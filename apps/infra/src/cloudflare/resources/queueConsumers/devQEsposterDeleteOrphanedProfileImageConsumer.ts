import DevJobsWorkerScriptName from "#src/cloudflare/constants/DevJobsWorkerScriptName";
import QueueConsumerRetryDelay from "#src/cloudflare/constants/QueueConsumerRetryDelay";
import { devDlqEsposterDeleteOrphanedProfileImage } from "#src/cloudflare/resources/queues/devDlqEsposterDeleteOrphanedProfileImage";
import { devQEsposterDeleteOrphanedProfileImage } from "#src/cloudflare/resources/queues/devQEsposterDeleteOrphanedProfileImage";
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
  CloudflareEnvironment.Development,
  CloudflareAssetType.Queue,
  QueueJob.DeleteOrphanedProfileImage,
);

export const devQEsposterDeleteOrphanedProfileImageConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  `${queueName}-consumer`,
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    deadLetterQueue: devDlqEsposterDeleteOrphanedProfileImage.queueName,
    queueId: devQEsposterDeleteOrphanedProfileImage.queueId,
    scriptName: DevJobsWorkerScriptName,
    settings: {
      maxRetries: QueueJobMaxRetriesMap[QueueJob.DeleteOrphanedProfileImage],
      retryDelay: QueueConsumerRetryDelay,
    },
    type: "worker",
  },
  { parent: devQEsposterDeleteOrphanedProfileImage, protect: true },
);
