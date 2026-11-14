import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { prodDlqEsposterDeleteOrphanedProfileImage } from "#src/cloudflare/resources/queues/prodDlqEsposterDeleteOrphanedProfileImage";
import { prodQEsposterDeleteOrphanedProfileImage } from "#src/cloudflare/resources/queues/prodQEsposterDeleteOrphanedProfileImage";
import {
  AzureFunction,
  CloudflareAssetType,
  CloudflareEnvironment,
  CloudflareWorkerPurpose,
  getCloudflareResourceName,
} from "@esposter/db-schema";
import { toKebabCase } from "@esposter/shared";
import * as cloudflare from "@pulumi/cloudflare";

const queueName = getCloudflareResourceName(
  CloudflareEnvironment.Production,
  CloudflareAssetType.Queue,
  toKebabCase(AzureFunction.DeleteOrphanedProfileImage),
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
    settings: QueueConsumerRetry.idempotent,
    type: "worker",
  },
  { parent: prodQEsposterDeleteOrphanedProfileImage, protect: true },
);
