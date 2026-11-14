import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import QueueConsumerRetryDelay from "#src/cloudflare/constants/QueueConsumerRetryDelay";
import { prodDlqEsposterProcessScheduledMessageJob } from "#src/cloudflare/resources/queues/prodDlqEsposterProcessScheduledMessageJob";
import { prodQEsposterProcessScheduledMessageJob } from "#src/cloudflare/resources/queues/prodQEsposterProcessScheduledMessageJob";
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
  CloudflareEnvironment.Production,
  CloudflareAssetType.Queue,
  QueueJob.ProcessScheduledMessageJob,
);
const scriptName = getCloudflareResourceName(
  CloudflareEnvironment.Production,
  CloudflareAssetType.Worker,
  CloudflareWorkerPurpose.Functions,
);

export const prodQEsposterProcessScheduledMessageJobConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  `${queueName}-consumer`,
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: prodDlqEsposterProcessScheduledMessageJob.queueName,
    queueId: prodQEsposterProcessScheduledMessageJob.queueId,
    scriptName,
    settings: {
      maxRetries: QueueJobMaxRetriesMap[QueueJob.ProcessScheduledMessageJob],
      retryDelay: QueueConsumerRetryDelay,
    },
    type: "worker",
  },
  { parent: prodQEsposterProcessScheduledMessageJob, protect: true },
);
