import { QueueJob } from "#src/models/queue/QueueJob";

// How many times a job's queue redelivers a message its handler threw on, before the message goes to the job's dead-letter
// Queue. Exhaustive over QueueJob on purpose: a new job has to state its answer here rather than inherit a default that
// Silently retries it. Each consumer in apps/infra reads its count from here.
const MAX_IDEMPOTENT_QUEUE_JOB_RETRIES = 5;

export const QueueJobMaxRetriesMap = {
  // Each sweep treats a gone target as done and the user row goes last, so a rerun finds only what a failed run left.
  [QueueJob.DeleteAccount]: MAX_IDEMPOTENT_QUEUE_JOB_RETRIES,
  // Deletes through deleteBlobs, which reads a blob an earlier attempt already removed as success.
  [QueueJob.DeleteOrphanedProfileImage]: MAX_IDEMPOTENT_QUEUE_JOB_RETRIES,
  // Rebuilds the export's own blob, named by its row's id, so a rerun overwrites the archive an earlier attempt wrote.
  [QueueJob.ExportUserData]: MAX_IDEMPOTENT_QUEUE_JOB_RETRIES,
  // Deletes each blob through deleteStorageBlobs, and R2 answers the delete of a blob already gone as success.
  [QueueJob.ProcessBlobDeletion]: MAX_IDEMPOTENT_QUEUE_JOB_RETRIES,
  // Delivers an already-persisted occurrence. Its bell write is the last step that may fail the delivery; everything after
  // It is best-effort, so a retry cannot repeat a side effect that already landed beyond the one bell row a crash can repeat.
  [QueueJob.ProcessNotification]: MAX_IDEMPOTENT_QUEUE_JOB_RETRIES,
  // The room writes the message under the push's delivery id, which is unique, so a rerun finds the message an earlier
  // Attempt wrote and writes nothing new.
  [QueueJob.ProcessWebhook]: MAX_IDEMPOTENT_QUEUE_JOB_RETRIES,
  // Sets the ledger row's counted bytes to what storage reports and moves the counter by the difference it observed, so
  // A redelivery computes a zero delta rather than double-counting.
  [QueueJob.ReconcileStorageLedgerEntry]: MAX_IDEMPOTENT_QUEUE_JOB_RETRIES,
} as const satisfies Record<QueueJob, number>;
