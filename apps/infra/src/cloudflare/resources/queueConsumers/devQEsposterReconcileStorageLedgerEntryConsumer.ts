import QueueConsumerRetryDelay from "#src/cloudflare/constants/QueueConsumerRetryDelay";
import { devDlqEsposterReconcileStorageLedgerEntry } from "#src/cloudflare/resources/queues/devDlqEsposterReconcileStorageLedgerEntry";
import { devQEsposterReconcileStorageLedgerEntry } from "#src/cloudflare/resources/queues/devQEsposterReconcileStorageLedgerEntry";
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
  CloudflareEnvironment.Development,
  CloudflareAssetType.Queue,
  QueueJob.ReconcileStorageLedgerEntry,
);
const scriptName = getCloudflareResourceName(
  CloudflareEnvironment.Development,
  CloudflareAssetType.Worker,
  CloudflareWorkerPurpose.Functions,
);

export const devQEsposterReconcileStorageLedgerEntryConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  `${queueName}-consumer`,
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    deadLetterQueue: devDlqEsposterReconcileStorageLedgerEntry.queueName,
    queueId: devQEsposterReconcileStorageLedgerEntry.queueId,
    scriptName,
    settings: {
      maxRetries: QueueJobMaxRetriesMap[QueueJob.ReconcileStorageLedgerEntry],
      retryDelay: QueueConsumerRetryDelay,
    },
    type: "worker",
  },
  { parent: devQEsposterReconcileStorageLedgerEntry, protect: true },
);
