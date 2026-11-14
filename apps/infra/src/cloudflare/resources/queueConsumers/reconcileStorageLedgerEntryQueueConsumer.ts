import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareWorkerName from "#src/cloudflare/constants/CloudflareWorkerName";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { reconcileStorageLedgerEntry } from "#src/cloudflare/resources/queues/reconcileStorageLedgerEntry";
import { reconcileStorageLedgerEntryDeadLetterQueue } from "#src/cloudflare/resources/queues/reconcileStorageLedgerEntryDeadLetterQueue";
import * as cloudflare from "@pulumi/cloudflare";

export const reconcileStorageLedgerEntryQueueConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  "queueConsumer-reconcile-storage-ledger-entry",
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: reconcileStorageLedgerEntryDeadLetterQueue.queueName,
    queueId: reconcileStorageLedgerEntry.queueId,
    scriptName: CloudflareWorkerName.esposterFunctions,
    settings: QueueConsumerRetry.idempotent,
    type: "worker",
  },
  { parent: reconcileStorageLedgerEntry, protect: true },
);
