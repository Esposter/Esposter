// The Azure Function names the live Event Grid subscriptions deliver to. Frozen with the Azure estate: the app's jobs are
// `QueueJob` now, and this file goes with the rest of `src/azure` at the cutover's teardown
export enum AzureFunction {
  DeleteAccount = "DeleteAccount",
  DeleteOrphanedProfileImage = "DeleteOrphanedProfileImage",
  ExportUserData = "ExportUserData",
  ProcessBlobDeletion = "ProcessBlobDeletion",
  ProcessNotification = "ProcessNotification",
  ProcessScheduledMessageJob = "ProcessScheduledMessageJob",
  ProcessWebhook = "ProcessWebhook",
  PurgeDeletedResources = "PurgeDeletedResources",
  PushWebhook = "PushWebhook",
  ReconcileStorageLedgerEntry = "ReconcileStorageLedgerEntry",
  ReplayDeadLetterEvent = "ReplayDeadLetterEvent",
  SendTodoReminder = "SendTodoReminder",
}
