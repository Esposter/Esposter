import ProdJobsWorkerScriptName from "#src/cloudflare/constants/ProdJobsWorkerScriptName";
import QueueConsumerRetryDelay from "#src/cloudflare/constants/QueueConsumerRetryDelay";
import { prodDlqEsposterDeleteAccount } from "#src/cloudflare/resources/queues/prodDlqEsposterDeleteAccount";
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
  CloudflareEnvironment.Production,
  CloudflareAssetType.DeadLetterQueue,
  QueueJob.DeleteAccount,
);

export const prodDlqEsposterDeleteAccountConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  `${deadLetterQueueName}-consumer`,
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    queueId: prodDlqEsposterDeleteAccount.queueId,
    scriptName: ProdJobsWorkerScriptName,
    settings: { maxRetries: DEAD_LETTER_CONSUMER_MAX_RETRIES, retryDelay: QueueConsumerRetryDelay },
    type: "worker",
  },
  { parent: prodDlqEsposterDeleteAccount, protect: true },
);
