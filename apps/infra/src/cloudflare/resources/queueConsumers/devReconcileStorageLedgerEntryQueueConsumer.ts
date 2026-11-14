import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareWorkerName from "#src/cloudflare/constants/CloudflareWorkerName";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { devReconcileStorageLedgerEntry } from "#src/cloudflare/resources/queues/devReconcileStorageLedgerEntry";
import { devReconcileStorageLedgerEntryDeadLetterQueue } from "#src/cloudflare/resources/queues/devReconcileStorageLedgerEntryDeadLetterQueue";
import * as cloudflare from "@pulumi/cloudflare";

export const devReconcileStorageLedgerEntryQueueConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  "queueConsumer-dev-reconcile-storage-ledger-entry",
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: devReconcileStorageLedgerEntryDeadLetterQueue.queueName,
    queueId: devReconcileStorageLedgerEntry.queueId,
    scriptName: CloudflareWorkerName.esposterFunctionsDev,
    settings: QueueConsumerRetry.idempotent,
    type: "worker",
  },
  { parent: devReconcileStorageLedgerEntry, protect: true },
);
