import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { devDlqEsposterReconcileStorageLedgerEntry } from "#src/cloudflare/resources/queues/devDlqEsposterReconcileStorageLedgerEntry";
import { devQEsposterReconcileStorageLedgerEntry } from "#src/cloudflare/resources/queues/devQEsposterReconcileStorageLedgerEntry";
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
  toKebabCase(AzureFunction.ReconcileStorageLedgerEntry),
);
const scriptName = getCloudflareResourceName(
  CloudflareEnvironment.Development,
  CloudflareAssetType.Worker,
  CloudflareWorkerPurpose.Functions,
);

export const devQEsposterReconcileStorageLedgerEntryConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  `${queueName}-consumer`,
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: devDlqEsposterReconcileStorageLedgerEntry.queueName,
    queueId: devQEsposterReconcileStorageLedgerEntry.queueId,
    scriptName,
    settings: QueueConsumerRetry.idempotent,
    type: "worker",
  },
  { parent: devQEsposterReconcileStorageLedgerEntry, protect: true },
);
