import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { prodDlqEsposterProcessBlobDeletion } from "#src/cloudflare/resources/queues/prodDlqEsposterProcessBlobDeletion";
import { prodQEsposterProcessBlobDeletion } from "#src/cloudflare/resources/queues/prodQEsposterProcessBlobDeletion";
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
  toKebabCase(AzureFunction.ProcessBlobDeletion),
);
const scriptName = getCloudflareResourceName(
  CloudflareEnvironment.Production,
  CloudflareAssetType.Worker,
  CloudflareWorkerPurpose.Functions,
);

export const prodQEsposterProcessBlobDeletionConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  `${queueName}-consumer`,
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: prodDlqEsposterProcessBlobDeletion.queueName,
    queueId: prodQEsposterProcessBlobDeletion.queueId,
    scriptName,
    settings: QueueConsumerRetry.idempotent,
    type: "worker",
  },
  { parent: prodQEsposterProcessBlobDeletion, protect: true },
);
