import { QueueJob } from "#src/models/queue/QueueJob";

// How many times a job's queue redelivers a message its handler threw on, before the message goes to the job's dead-letter
// queue. Exhaustive over QueueJob on purpose: a new job has to state its answer here rather than inherit a default that
// silently retries it. Event Grid made ten delivery attempts, and a queue's max_retries counts the retries after the first.
const MAX_IDEMPOTENT_QUEUE_JOB_RETRIES = 9;

export const QueueJobMaxRetriesMap = {
  // Each sweep treats a gone target as done and the user row goes last, so a rerun finds only what a failed run left.
  [QueueJob.DeleteAccount]: MAX_IDEMPOTENT_QUEUE_JOB_RETRIES,
  // Deletes through deleteBlobs, which reads a blob an earlier attempt already removed as success.
  [QueueJob.DeleteOrphanedProfileImage]: MAX_IDEMPOTENT_QUEUE_JOB_RETRIES,
  // Rebuilds the export's own blob, named by its row's id, so a rerun overwrites the archive an earlier attempt wrote.
  [QueueJob.ExportUserData]: MAX_IDEMPOTENT_QUEUE_JOB_RETRIES,
  // Deletes each blob with deleteIfExists, so a blob an earlier attempt already removed is a no-op rather than a failure.
  [QueueJob.ProcessBlobDeletion]: MAX_IDEMPOTENT_QUEUE_JOB_RETRIES,
  // Delivers an already-persisted occurrence. Its bell write is the last step that may fail the delivery; everything after
  // it is best-effort, so a retry cannot repeat a side effect that already landed beyond the one bell row a crash can repeat.
  [QueueJob.ProcessNotification]: MAX_IDEMPOTENT_QUEUE_JOB_RETRIES,
  // Claims its job on `processingStartedAt IS NULL` first, so a rerun finds the job already claimed and does nothing.
  [QueueJob.ProcessScheduledMessageJob]: MAX_IDEMPOTENT_QUEUE_JOB_RETRIES,
  // Creates a message whose rowKey is a fresh reverse-ticked timestamp, so a rerun writes a second, indistinguishable
  // message into the room rather than repairing the first. A failed webhook goes straight to its dead-letter queue.
  [QueueJob.ProcessWebhook]: 0,
  // Sets the ledger row's counted bytes to what storage reports and moves the counter by the difference it observed, so
  // a redelivery computes a zero delta rather than double-counting.
  [QueueJob.ReconcileStorageLedgerEntry]: MAX_IDEMPOTENT_QUEUE_JOB_RETRIES,
  [QueueJob.SendTodoReminder]: MAX_IDEMPOTENT_QUEUE_JOB_RETRIES,
} as const satisfies Record<QueueJob, number>;
