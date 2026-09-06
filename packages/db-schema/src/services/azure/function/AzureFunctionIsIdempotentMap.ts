import { AzureFunction } from "#src/models/azure/function/AzureFunction";

// Whether running a handler twice on the same event leaves the same state as running it once. Event Grid delivery is
// At-least-once, so this is what decides whether a dead-lettered event may be republished (replayDeadLetterEventHandler)
// Or must be quarantined for a human: a non-idempotent replay does not retry work, it duplicates it.
//
// Exhaustive over AzureFunction on purpose — a new function has to state its answer here rather than inherit a default
// That silently makes its dead-letters replayable.
export const AzureFunctionIsIdempotentMap = {
  // Deletes each blob with deleteIfExists, so a blob an earlier attempt already removed is a no-op rather than a
  // 404: a replay converges on the same empty state instead of duplicating work.
  [AzureFunction.ProcessBlobDeletion]: true,
  // Delivers an already-persisted occurrence to its recipients. Its bell write is the last step that may fail the
  // Invocation — the retention trim, the subscription read and every push past it are best-effort — so an event
  // That dead-lettered is one whose rows never landed, and the replay writes them once rather than twice. That
  // Tail staying best-effort is what keeps this `true`: a throw after the insert would ask for a redelivery that
  // Duplicates the rows it already wrote.
  [AzureFunction.ProcessNotification]: true,
  // Creates a message like ProcessWebhook does, but claims its job on `processingStartedAt IS NULL` first: a rerun
  // Finds the job already claimed and does nothing, so the second copy the fresh rowKey would produce never lands.
  [AzureFunction.ProcessScheduledMessageJob]: true,
  // Creates a message whose rowKey is a fresh reverse-ticked timestamp (createMessage), so a rerun writes a second,
  // Indistinguishable message into the room rather than repairing the first.
  [AzureFunction.ProcessWebhook]: false,
  [AzureFunction.PurgeDeletedResources]: true,
  [AzureFunction.PushWebhook]: false,
  // Sets the ledger row's counted bytes to what storage reports and moves the counter by the difference it
  // Observed, so a redelivery computes a zero delta rather than double-counting. The replay gate never reads
  // This one: it is the only handler triggered by a *system* topic, so its dead letters carry a storage
  // `eventType` (`Microsoft.Storage.BlobCreated`) rather than an AzureFunction, and checkIsReplayable
  // Quarantines anything it cannot resolve to a function. The value is its honest answer, not a reachable path
  // (/docs/platform/storage-quotas).
  [AzureFunction.ReconcileStorageLedgerEntry]: true,
  // Republishes a dead-letter blob it then deletes; a rerun of the same blob is a no-op, but it is never itself
  // Dead-lettered onto a topic, so the value is only here for exhaustiveness.
  [AzureFunction.ReplayDeadLetterEvent]: true,
  [AzureFunction.SendTodoReminder]: true,
} as const satisfies Record<AzureFunction, boolean>;
