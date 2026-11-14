import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { devDlqEsposterProcessScheduledMessageJob } from "#src/cloudflare/resources/queues/devDlqEsposterProcessScheduledMessageJob";
import { devQEsposterProcessScheduledMessageJob } from "#src/cloudflare/resources/queues/devQEsposterProcessScheduledMessageJob";
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
  toKebabCase(AzureFunction.ProcessScheduledMessageJob),
);
const scriptName = getCloudflareResourceName(
  CloudflareEnvironment.Development,
  CloudflareAssetType.Worker,
  CloudflareWorkerPurpose.Functions,
);

export const devQEsposterProcessScheduledMessageJobConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  `${queueName}-consumer`,
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: devDlqEsposterProcessScheduledMessageJob.queueName,
    queueId: devQEsposterProcessScheduledMessageJob.queueId,
    scriptName,
    settings: QueueConsumerRetry.idempotent,
    type: "worker",
  },
  { parent: devQEsposterProcessScheduledMessageJob, protect: true },
);
