import QueueConsumerRetryDelay from "#src/cloudflare/constants/QueueConsumerRetryDelay";
import { prodDlqEsposterDeleteAccount } from "#src/cloudflare/resources/queues/prodDlqEsposterDeleteAccount";
import { prodQEsposterDeleteAccount } from "#src/cloudflare/resources/queues/prodQEsposterDeleteAccount";
import {
  CLOUDFLARE_ACCOUNT_ID,
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
  QueueJob.DeleteAccount,
);
const scriptName = getCloudflareResourceName(
  CloudflareEnvironment.Production,
  CloudflareAssetType.Worker,
  CloudflareWorkerPurpose.Functions,
);

export const prodQEsposterDeleteAccountConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  `${queueName}-consumer`,
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    deadLetterQueue: prodDlqEsposterDeleteAccount.queueName,
    queueId: prodQEsposterDeleteAccount.queueId,
    scriptName,
    settings: { maxRetries: QueueJobMaxRetriesMap[QueueJob.DeleteAccount], retryDelay: QueueConsumerRetryDelay },
    type: "worker",
  },
  { parent: prodQEsposterDeleteAccount, protect: true },
);
