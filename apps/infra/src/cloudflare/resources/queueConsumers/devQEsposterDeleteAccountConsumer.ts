import DevJobsWorkerScriptName from "#src/cloudflare/constants/DevJobsWorkerScriptName";
import QueueConsumerRetryDelay from "#src/cloudflare/constants/QueueConsumerRetryDelay";
import { devDlqEsposterDeleteAccount } from "#src/cloudflare/resources/queues/devDlqEsposterDeleteAccount";
import { devQEsposterDeleteAccount } from "#src/cloudflare/resources/queues/devQEsposterDeleteAccount";
import {
  CLOUDFLARE_ACCOUNT_ID,
  CloudflareAssetType,
  CloudflareEnvironment,
  getCloudflareResourceName,
  QueueJob,
  QueueJobMaxRetriesMap,
} from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const queueName = getCloudflareResourceName(
  CloudflareEnvironment.Development,
  CloudflareAssetType.Queue,
  QueueJob.DeleteAccount,
);

export const devQEsposterDeleteAccountConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  `${queueName}-consumer`,
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    deadLetterQueue: devDlqEsposterDeleteAccount.queueName,
    queueId: devQEsposterDeleteAccount.queueId,
    scriptName: DevJobsWorkerScriptName,
    settings: { maxRetries: QueueJobMaxRetriesMap[QueueJob.DeleteAccount], retryDelay: QueueConsumerRetryDelay },
    type: "worker",
  },
  { parent: devQEsposterDeleteAccount, protect: true },
);
