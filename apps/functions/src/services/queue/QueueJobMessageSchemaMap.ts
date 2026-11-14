import {
  blobDeletionQueueMessageSchema,
  deleteAccountQueueMessageSchema,
  exportUserDataQueueMessageSchema,
  notificationQueueMessageSchema,
  QueueJob,
  r2ObjectCreatedQueueMessageSchema,
  webhookQueueMessageSchema,
} from "@esposter/db-schema";
import type { QueueMessageEnvelope } from "@esposter/db-schema";
import { z } from "zod";

// Each job's message schema, which dead-letter replay parses a dead letter with. Exhaustive over QueueJob, and every
// member carries the queue envelope, so a job cannot be replayed on a body that has no attempt count to raise
export const QueueJobMessageSchemaMap = {
  [QueueJob.DeleteAccount]: deleteAccountQueueMessageSchema,
  [QueueJob.DeleteOrphanedProfileImage]: r2ObjectCreatedQueueMessageSchema,
  [QueueJob.ExportUserData]: exportUserDataQueueMessageSchema,
  [QueueJob.ProcessBlobDeletion]: blobDeletionQueueMessageSchema,
  [QueueJob.ProcessNotification]: notificationQueueMessageSchema,
  [QueueJob.ProcessWebhook]: webhookQueueMessageSchema,
  [QueueJob.ReconcileStorageLedgerEntry]: r2ObjectCreatedQueueMessageSchema,
} satisfies Record<QueueJob, z.ZodType<QueueMessageEnvelope>>;
