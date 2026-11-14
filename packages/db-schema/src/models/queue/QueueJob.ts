import { z } from "zod";

// One job per queue. A job's Cloudflare Queue and its dead-letter queue are named from its kebab-case value, and the
// Functions Worker dispatches each batch on that name. Renamed from `AzureFunction`, which named the Azure Function
// That ran each job. Purging deleted resources is not here: it runs on a Cron Trigger, not from a queue.
export const QueueJob = {
  DeleteAccount: "delete-account",
  DeleteOrphanedProfileImage: "delete-orphaned-profile-image",
  ExportUserData: "export-user-data",
  ProcessBlobDeletion: "process-blob-deletion",
  ProcessNotification: "process-notification",
  ProcessWebhook: "process-webhook",
  ReconcileStorageLedgerEntry: "reconcile-storage-ledger-entry",
} as const;
export type QueueJob = (typeof QueueJob)[keyof typeof QueueJob];

export const queueJobSchema = z.enum(QueueJob) satisfies z.ZodType<QueueJob>;
