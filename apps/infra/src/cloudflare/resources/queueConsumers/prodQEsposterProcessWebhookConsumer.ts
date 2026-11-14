import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { prodDlqEsposterProcessWebhook } from "#src/cloudflare/resources/queues/prodDlqEsposterProcessWebhook";
import { prodQEsposterProcessWebhook } from "#src/cloudflare/resources/queues/prodQEsposterProcessWebhook";
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
  toKebabCase(AzureFunction.ProcessWebhook),
);
const scriptName = getCloudflareResourceName(
  CloudflareEnvironment.Production,
  CloudflareAssetType.Worker,
  CloudflareWorkerPurpose.Functions,
);

export const prodQEsposterProcessWebhookConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  `${queueName}-consumer`,
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: prodDlqEsposterProcessWebhook.queueName,
    queueId: prodQEsposterProcessWebhook.queueId,
    scriptName,
    settings: QueueConsumerRetry.nonIdempotent,
    type: "worker",
  },
  { parent: prodQEsposterProcessWebhook, protect: true },
);
