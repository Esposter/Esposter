import { AzureFunction } from "@/models/azure/function/AzureFunction";

// Whether running a handler twice on the same event leaves the same state as running it once. Event Grid delivery is
// At-least-once, so this is what decides whether a dead-lettered event may be republished (replayDeadLetterEventHandler)
// Or must be quarantined for a human: a non-idempotent replay does not retry work, it duplicates it.
//
// Exhaustive over AzureFunction on purpose — a new function has to state its answer here rather than inherit a default
// That silently makes its dead-letters replayable.
export const IsIdempotentAzureFunctionMap = {
  // Deletes each blob with deleteIfExists, so a blob an earlier attempt already removed is a no-op rather than a
  // 404: a replay converges on the same empty state instead of duplicating work.
  [AzureFunction.ProcessBlobDeletion]: true,
  // Sends a push to the subscriptions of an already-persisted message: a second send is a duplicate notification for a
  // Notification that was never delivered in the first place, which is the outcome the replay exists to produce.
  [AzureFunction.ProcessFriendRequestNotification]: true,
  [AzureFunction.ProcessPushNotification]: true,
  // Creates a message like ProcessWebhook does, but claims its job on `processingStartedAt IS NULL` first: a rerun
  // Finds the job already claimed and does nothing, so the second copy the fresh rowKey would produce never lands.
  [AzureFunction.ProcessScheduledMessageJob]: true,
  [AzureFunction.ProcessThreadReplyNotification]: true,
  // Creates a message whose rowKey is a fresh reverse-ticked timestamp (createMessage), so a rerun writes a second,
  // Indistinguishable message into the room rather than repairing the first.
  [AzureFunction.ProcessWebhook]: false,
  [AzureFunction.PurgeDeletedResources]: true,
  [AzureFunction.PushWebhook]: false,
  // Sets the ledger row's counted bytes to what storage reports and moves the counter by the difference it
  // Observed, so a redelivery computes a zero delta rather than double-counting.
  [AzureFunction.ReconcileStorageBlob]: true,
  // Republishes a dead-letter blob it then deletes; a rerun of the same blob is a no-op, but it is never itself
  // Dead-lettered onto a topic, so the value is only here for exhaustiveness.
  [AzureFunction.ReplayDeadLetterEvent]: true,
  [AzureFunction.SendTodoReminder]: true,
} as const satisfies Record<AzureFunction, boolean>;
