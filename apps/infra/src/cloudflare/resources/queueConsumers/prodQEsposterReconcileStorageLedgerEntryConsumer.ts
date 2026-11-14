import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { prodDlqEsposterReconcileStorageLedgerEntry } from "#src/cloudflare/resources/queues/prodDlqEsposterReconcileStorageLedgerEntry";
import { prodQEsposterReconcileStorageLedgerEntry } from "#src/cloudflare/resources/queues/prodQEsposterReconcileStorageLedgerEntry";
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
  toKebabCase(AzureFunction.ReconcileStorageLedgerEntry),
);
const scriptName = getCloudflareResourceName(
  CloudflareEnvironment.Production,
  CloudflareAssetType.Worker,
  CloudflareWorkerPurpose.Functions,
);

export const prodQEsposterReconcileStorageLedgerEntryConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  `${queueName}-consumer`,
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: prodDlqEsposterReconcileStorageLedgerEntry.queueName,
    queueId: prodQEsposterReconcileStorageLedgerEntry.queueId,
    scriptName,
    settings: QueueConsumerRetry.idempotent,
    type: "worker",
  },
  { parent: prodQEsposterReconcileStorageLedgerEntry, protect: true },
);
