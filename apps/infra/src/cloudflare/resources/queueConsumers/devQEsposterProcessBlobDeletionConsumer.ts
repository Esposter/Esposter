import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { devDlqEsposterProcessBlobDeletion } from "#src/cloudflare/resources/queues/devDlqEsposterProcessBlobDeletion";
import { devQEsposterProcessBlobDeletion } from "#src/cloudflare/resources/queues/devQEsposterProcessBlobDeletion";
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
  CloudflareEnvironment.Development,
  CloudflareAssetType.Queue,
  toKebabCase(AzureFunction.ProcessBlobDeletion),
);
const scriptName = getCloudflareResourceName(
  CloudflareEnvironment.Development,
  CloudflareAssetType.Worker,
  CloudflareWorkerPurpose.Functions,
);

export const devQEsposterProcessBlobDeletionConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  `${queueName}-consumer`,
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: devDlqEsposterProcessBlobDeletion.queueName,
    queueId: devQEsposterProcessBlobDeletion.queueId,
    scriptName,
    settings: QueueConsumerRetry.idempotent,
    type: "worker",
  },
  { parent: devQEsposterProcessBlobDeletion, protect: true },
);
