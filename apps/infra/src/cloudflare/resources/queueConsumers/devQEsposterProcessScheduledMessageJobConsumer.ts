import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import QueueConsumerRetryDelay from "#src/cloudflare/constants/QueueConsumerRetryDelay";
import { devDlqEsposterProcessScheduledMessageJob } from "#src/cloudflare/resources/queues/devDlqEsposterProcessScheduledMessageJob";
import { devQEsposterProcessScheduledMessageJob } from "#src/cloudflare/resources/queues/devQEsposterProcessScheduledMessageJob";
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
  CloudflareEnvironment.Development,
  CloudflareAssetType.Queue,
  QueueJob.ProcessScheduledMessageJob,
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
    settings: {
      maxRetries: QueueJobMaxRetriesMap[QueueJob.ProcessScheduledMessageJob],
      retryDelay: QueueConsumerRetryDelay,
    },
    type: "worker",
  },
  { parent: devQEsposterProcessScheduledMessageJob, protect: true },
);
