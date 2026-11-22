import type * as cloudflare from "@pulumi/cloudflare";

import { devDlqEsposterDeleteAccount } from "#src/cloudflare/resources/queues/devDlqEsposterDeleteAccount";
import { devDlqEsposterDeleteOrphanedProfileImage } from "#src/cloudflare/resources/queues/devDlqEsposterDeleteOrphanedProfileImage";
import { devDlqEsposterExportUserData } from "#src/cloudflare/resources/queues/devDlqEsposterExportUserData";
import { devDlqEsposterProcessBlobDeletion } from "#src/cloudflare/resources/queues/devDlqEsposterProcessBlobDeletion";
import { devDlqEsposterProcessNotification } from "#src/cloudflare/resources/queues/devDlqEsposterProcessNotification";
import { devDlqEsposterProcessWebhook } from "#src/cloudflare/resources/queues/devDlqEsposterProcessWebhook";
import { devDlqEsposterReconcileStorageLedgerEntry } from "#src/cloudflare/resources/queues/devDlqEsposterReconcileStorageLedgerEntry";
import { devQEsposterDeleteAccount } from "#src/cloudflare/resources/queues/devQEsposterDeleteAccount";
import { devQEsposterDeleteOrphanedProfileImage } from "#src/cloudflare/resources/queues/devQEsposterDeleteOrphanedProfileImage";
import { devQEsposterExportUserData } from "#src/cloudflare/resources/queues/devQEsposterExportUserData";
import { devQEsposterProcessBlobDeletion } from "#src/cloudflare/resources/queues/devQEsposterProcessBlobDeletion";
import { devQEsposterProcessNotification } from "#src/cloudflare/resources/queues/devQEsposterProcessNotification";
import { devQEsposterProcessWebhook } from "#src/cloudflare/resources/queues/devQEsposterProcessWebhook";
import { devQEsposterReconcileStorageLedgerEntry } from "#src/cloudflare/resources/queues/devQEsposterReconcileStorageLedgerEntry";
import { prodDlqEsposterDeleteAccount } from "#src/cloudflare/resources/queues/prodDlqEsposterDeleteAccount";
import { prodDlqEsposterDeleteOrphanedProfileImage } from "#src/cloudflare/resources/queues/prodDlqEsposterDeleteOrphanedProfileImage";
import { prodDlqEsposterExportUserData } from "#src/cloudflare/resources/queues/prodDlqEsposterExportUserData";
import { prodDlqEsposterProcessBlobDeletion } from "#src/cloudflare/resources/queues/prodDlqEsposterProcessBlobDeletion";
import { prodDlqEsposterProcessNotification } from "#src/cloudflare/resources/queues/prodDlqEsposterProcessNotification";
import { prodDlqEsposterProcessWebhook } from "#src/cloudflare/resources/queues/prodDlqEsposterProcessWebhook";
import { prodDlqEsposterReconcileStorageLedgerEntry } from "#src/cloudflare/resources/queues/prodDlqEsposterReconcileStorageLedgerEntry";
import { prodQEsposterDeleteAccount } from "#src/cloudflare/resources/queues/prodQEsposterDeleteAccount";
import { prodQEsposterDeleteOrphanedProfileImage } from "#src/cloudflare/resources/queues/prodQEsposterDeleteOrphanedProfileImage";
import { prodQEsposterExportUserData } from "#src/cloudflare/resources/queues/prodQEsposterExportUserData";
import { prodQEsposterProcessBlobDeletion } from "#src/cloudflare/resources/queues/prodQEsposterProcessBlobDeletion";
import { prodQEsposterProcessNotification } from "#src/cloudflare/resources/queues/prodQEsposterProcessNotification";
import { prodQEsposterProcessWebhook } from "#src/cloudflare/resources/queues/prodQEsposterProcessWebhook";
import { prodQEsposterReconcileStorageLedgerEntry } from "#src/cloudflare/resources/queues/prodQEsposterReconcileStorageLedgerEntry";
import { CloudflareEnvironment, QueueJob } from "@esposter/db-schema";

/**
 * The queue and dead-letter queue of each job, by environment, so a consumer takes its pair from one entry and cannot
 * pair a queue with another job's dead letters
 */
export const queueJobResources: Record<
  CloudflareEnvironment,
  Record<QueueJob, { deadLetterQueue: cloudflare.Queue; queue: cloudflare.Queue }>
> = {
  [CloudflareEnvironment.Development]: {
    [QueueJob.DeleteAccount]: { deadLetterQueue: devDlqEsposterDeleteAccount, queue: devQEsposterDeleteAccount },
    [QueueJob.DeleteOrphanedProfileImage]: {
      deadLetterQueue: devDlqEsposterDeleteOrphanedProfileImage,
      queue: devQEsposterDeleteOrphanedProfileImage,
    },
    [QueueJob.ExportUserData]: { deadLetterQueue: devDlqEsposterExportUserData, queue: devQEsposterExportUserData },
    [QueueJob.ProcessBlobDeletion]: {
      deadLetterQueue: devDlqEsposterProcessBlobDeletion,
      queue: devQEsposterProcessBlobDeletion,
    },
    [QueueJob.ProcessNotification]: {
      deadLetterQueue: devDlqEsposterProcessNotification,
      queue: devQEsposterProcessNotification,
    },
    [QueueJob.ProcessWebhook]: { deadLetterQueue: devDlqEsposterProcessWebhook, queue: devQEsposterProcessWebhook },
    [QueueJob.ReconcileStorageLedgerEntry]: {
      deadLetterQueue: devDlqEsposterReconcileStorageLedgerEntry,
      queue: devQEsposterReconcileStorageLedgerEntry,
    },
  },
  [CloudflareEnvironment.Production]: {
    [QueueJob.DeleteAccount]: { deadLetterQueue: prodDlqEsposterDeleteAccount, queue: prodQEsposterDeleteAccount },
    [QueueJob.DeleteOrphanedProfileImage]: {
      deadLetterQueue: prodDlqEsposterDeleteOrphanedProfileImage,
      queue: prodQEsposterDeleteOrphanedProfileImage,
    },
    [QueueJob.ExportUserData]: { deadLetterQueue: prodDlqEsposterExportUserData, queue: prodQEsposterExportUserData },
    [QueueJob.ProcessBlobDeletion]: {
      deadLetterQueue: prodDlqEsposterProcessBlobDeletion,
      queue: prodQEsposterProcessBlobDeletion,
    },
    [QueueJob.ProcessNotification]: {
      deadLetterQueue: prodDlqEsposterProcessNotification,
      queue: prodQEsposterProcessNotification,
    },
    [QueueJob.ProcessWebhook]: { deadLetterQueue: prodDlqEsposterProcessWebhook, queue: prodQEsposterProcessWebhook },
    [QueueJob.ReconcileStorageLedgerEntry]: {
      deadLetterQueue: prodDlqEsposterReconcileStorageLedgerEntry,
      queue: prodQEsposterReconcileStorageLedgerEntry,
    },
  },
};
