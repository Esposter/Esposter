import { QueueJob } from "@esposter/db-schema";

import { deleteAccountHandler } from "#src/handlers/deleteAccountHandler";
import { deleteOrphanedProfileImageHandler } from "#src/handlers/deleteOrphanedProfileImageHandler";
import { exportUserDataHandler } from "#src/handlers/exportUserDataHandler";
import { processBlobDeletionHandler } from "#src/handlers/processBlobDeletionHandler";
import { processNotificationHandler } from "#src/handlers/processNotificationHandler";
import { processScheduledMessageJobHandler } from "#src/handlers/processScheduledMessageJobHandler";
import { processWebhookHandler } from "#src/handlers/processWebhookHandler";
import { reconcileStorageLedgerEntryHandler } from "#src/handlers/reconcileStorageLedgerEntryHandler";

// Each job's handler, keyed by the job the queue delivers. Exhaustive over QueueJob, so a new job has to name its handler
export const QueueJobHandlerMap = {
  [QueueJob.DeleteAccount]: deleteAccountHandler,
  [QueueJob.DeleteOrphanedProfileImage]: deleteOrphanedProfileImageHandler,
  [QueueJob.ExportUserData]: exportUserDataHandler,
  [QueueJob.ProcessBlobDeletion]: processBlobDeletionHandler,
  [QueueJob.ProcessNotification]: processNotificationHandler,
  [QueueJob.ProcessScheduledMessageJob]: processScheduledMessageJobHandler,
  [QueueJob.ProcessWebhook]: processWebhookHandler,
  [QueueJob.ReconcileStorageLedgerEntry]: reconcileStorageLedgerEntryHandler,
} satisfies Record<QueueJob, (body: unknown) => Promise<void>>;
