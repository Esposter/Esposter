import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { devDlqEsposterProcessWebhook } from "#src/cloudflare/resources/queues/devDlqEsposterProcessWebhook";
import { devQEsposterProcessWebhook } from "#src/cloudflare/resources/queues/devQEsposterProcessWebhook";
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
  toKebabCase(AzureFunction.ProcessWebhook),
);
const scriptName = getCloudflareResourceName(
  CloudflareEnvironment.Development,
  CloudflareAssetType.Worker,
  CloudflareWorkerPurpose.Functions,
);

export const devQEsposterProcessWebhookConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  `${queueName}-consumer`,
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: devDlqEsposterProcessWebhook.queueName,
    queueId: devQEsposterProcessWebhook.queueId,
    scriptName,
    settings: QueueConsumerRetry.nonIdempotent,
    type: "worker",
  },
  { parent: devQEsposterProcessWebhook, protect: true },
);
