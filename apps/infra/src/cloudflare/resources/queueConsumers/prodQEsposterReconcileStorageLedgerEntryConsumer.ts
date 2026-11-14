import QueueConsumerRetryDelay from "#src/cloudflare/constants/QueueConsumerRetryDelay";
import { prodDlqEsposterReconcileStorageLedgerEntry } from "#src/cloudflare/resources/queues/prodDlqEsposterReconcileStorageLedgerEntry";
import { prodQEsposterReconcileStorageLedgerEntry } from "#src/cloudflare/resources/queues/prodQEsposterReconcileStorageLedgerEntry";
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
  QueueJob.ReconcileStorageLedgerEntry,
);
const scriptName = getCloudflareResourceName(
  CloudflareEnvironment.Production,
  CloudflareAssetType.Worker,
  CloudflareWorkerPurpose.Functions,
);

export const prodQEsposterReconcileStorageLedgerEntryConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  `${queueName}-consumer`,
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    deadLetterQueue: prodDlqEsposterReconcileStorageLedgerEntry.queueName,
    queueId: prodQEsposterReconcileStorageLedgerEntry.queueId,
    scriptName,
    settings: {
      maxRetries: QueueJobMaxRetriesMap[QueueJob.ReconcileStorageLedgerEntry],
      retryDelay: QueueConsumerRetryDelay,
    },
    type: "worker",
  },
  { parent: prodQEsposterReconcileStorageLedgerEntry, protect: true },
);
