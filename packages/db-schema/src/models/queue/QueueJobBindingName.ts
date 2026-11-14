import { QueueJob } from "#src/models/queue/QueueJob";

// The producer binding each job's queue is sent through, in SCREAMING_SNAKE with a `_QUEUE` suffix. A Worker reads its
// bindings by these names, so each job's binding is written once here and every call site names the job instead
export const QueueJobBindingNameMap = {
  [QueueJob.DeleteAccount]: "DELETE_ACCOUNT_QUEUE",
  [QueueJob.DeleteOrphanedProfileImage]: "DELETE_ORPHANED_PROFILE_IMAGE_QUEUE",
  [QueueJob.ExportUserData]: "EXPORT_USER_DATA_QUEUE",
  [QueueJob.ProcessBlobDeletion]: "PROCESS_BLOB_DELETION_QUEUE",
  [QueueJob.ProcessNotification]: "PROCESS_NOTIFICATION_QUEUE",
  [QueueJob.ProcessWebhook]: "PROCESS_WEBHOOK_QUEUE",
  [QueueJob.ReconcileStorageLedgerEntry]: "RECONCILE_STORAGE_LEDGER_ENTRY_QUEUE",
} as const satisfies Record<QueueJob, string>;

export type QueueJobBindingName = (typeof QueueJobBindingNameMap)[QueueJob];
