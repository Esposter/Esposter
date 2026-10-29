import { AzureFunction } from "#src/models/azure/function/AzureFunction";

// Whether running a handler twice on the same event leaves the same state as running it once. Event Grid delivery is
// At-least-once, so this is what decides whether a dead-lettered event may be republished
// (replayDeadLetterEventHandler)
// Or must be quarantined for a human: a non-idempotent replay does not retry work, it duplicates it.
//
// Exhaustive over AzureFunction on purpose — a new function has to state its answer here rather than inherit a default
// That silently makes its dead-letters replayable.
export const AzureFunctionIsIdempotentMap = {
  // Each sweep treats a gone target as done and the user row goes last, so a replay finds only what a failed run left.
  [AzureFunction.DeleteAccount]: true,
  // Deletes through deleteBlobs, which reads a blob an earlier attempt already removed as success, so a rerun finds
  // Nothing left to remove and changes nothing.
  [AzureFunction.DeleteOrphanedProfileImage]: true,
  // Rebuilds the export's own blob, named by its row's id.
  // A rerun overwrites the archive an earlier attempt wrote rather than adding a second one.
  // The row's status moves to ready only after that upload commits.
  [AzureFunction.ExportUserData]: true,
  // Deletes each blob with deleteIfExists, so a blob an earlier attempt already removed is a no-op rather than a
  // 404: a replay converges on the same empty state instead of duplicating work.
  [AzureFunction.ProcessBlobDeletion]: true,
  // Delivers an already-persisted occurrence to its recipients. Its bell write is the last step that may fail the
  // Invocation — the retention trim, the subscription read and every push past it are best-effort — so nothing the
  // Handler does after the rows land can ask for the redelivery that would write them twice.
  //
  // What that does not remove is delivery's own at-least-once window: a host that dies between the insert
  // Committing and the acknowledgement reaching Event Grid is redelivered and inserts a second set of rows. Closing
  // That needs the envelope's event id claimed in the same transaction as the insert, the way
  // ProcessScheduledMessageJob claims its job below — and it is deliberately not built, because the cost of the
  // Duplicate is one repeated bell row and one repeated push, which the retention trim bounds and the reader
  // Dismisses. The claim is what a duplicate *message in a room* is worth, not what a duplicate notification is.
  // So this `true` means "no handler-caused duplicate", which is the bar the replay gate needs: a dead letter is
  // Almost always an occurrence nobody was told about, and quarantining it to avoid a rare double-notify would
  // Trade a certain silence for an unlikely repeat.
  [AzureFunction.ProcessNotification]: true,
  // Creates a message like ProcessWebhook does, but claims its job on `processingStartedAt IS NULL` first: a rerun
  // Finds the job already claimed and does nothing, so the second copy the fresh rowKey would produce never lands.
  [AzureFunction.ProcessScheduledMessageJob]: true,
  // Creates a message whose rowKey is a fresh reverse-ticked timestamp (createMessage), so a rerun writes a second,
  // Indistinguishable message into the room rather than repairing the first.
  [AzureFunction.ProcessWebhook]: false,
  [AzureFunction.PurgeDeletedResources]: true,
  // Enumerates every survey row at the moment it runs, with no time bound, so a replay hours after a failed run would
  // Purge the surveys created since. Running it again is the owner's decision, so a dead letter waits in quarantine
  // For the owner to publish the event again rather than being republished by the replay.
  [AzureFunction.PurgeSurveyResources]: false,
  [AzureFunction.PushWebhook]: false,
  // Sets the ledger row's counted bytes to what storage reports and moves the counter by the difference it
  // Observed, so a redelivery computes a zero delta rather than double-counting. The replay gate never reads
  // This one: it is the only handler triggered by a *system* topic, so its dead letters carry a storage
  // `eventType` (`Microsoft.Storage.BlobCreated`) rather than an AzureFunction, and checkIsReplayable
  // Quarantines anything it cannot resolve to a function. The value is its honest answer, not a reachable path
  // (openspec/specs/resource/storage-quotas/design.md).
  [AzureFunction.ReconcileStorageLedgerEntry]: true,
  // Republishes a dead-letter blob it then deletes; a rerun of the same blob is a no-op, but it is never itself
  // Dead-lettered onto a topic, so the value is only here for exhaustiveness.
  [AzureFunction.ReplayDeadLetterEvent]: true,
  [AzureFunction.SendTodoReminder]: true,
} as const satisfies Record<AzureFunction, boolean>;
