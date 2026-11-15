import DevJobsWorkerScriptName from "#src/cloudflare/constants/DevJobsWorkerScriptName";
import QueueConsumerRetryDelay from "#src/cloudflare/constants/QueueConsumerRetryDelay";
import { devDlqEsposterDeleteOrphanedProfileImage } from "#src/cloudflare/resources/queues/devDlqEsposterDeleteOrphanedProfileImage";
import {
  CLOUDFLARE_ACCOUNT_ID,
  CloudflareAssetType,
  CloudflareEnvironment,
  DEAD_LETTER_CONSUMER_MAX_RETRIES,
  getCloudflareResourceName,
  QueueJob,
} from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const deadLetterQueueName = getCloudflareResourceName(
  CloudflareEnvironment.Development,
  CloudflareAssetType.DeadLetterQueue,
  QueueJob.DeleteOrphanedProfileImage,
);

export const devDlqEsposterDeleteOrphanedProfileImageConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  `${deadLetterQueueName}-consumer`,
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    queueId: devDlqEsposterDeleteOrphanedProfileImage.queueId,
    scriptName: DevJobsWorkerScriptName,
    settings: { maxRetries: DEAD_LETTER_CONSUMER_MAX_RETRIES, retryDelay: QueueConsumerRetryDelay },
    type: "worker",
  },
  { parent: devDlqEsposterDeleteOrphanedProfileImage, protect: true },
);
