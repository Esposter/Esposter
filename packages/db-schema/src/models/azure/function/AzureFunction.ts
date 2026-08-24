import { z } from "zod";

export enum AzureFunction {
  ProcessBlobDeletion = "ProcessBlobDeletion",
  ProcessFriendRequestNotification = "ProcessFriendRequestNotification",
  ProcessPushNotification = "ProcessPushNotification",
  ProcessScheduledMessageJob = "ProcessScheduledMessageJob",
  ProcessThreadReplyNotification = "ProcessThreadReplyNotification",
  ProcessWebhook = "ProcessWebhook",
  PurgeDeletedResources = "PurgeDeletedResources",
  PushWebhook = "PushWebhook",
  ReconcileStorageLedgerEntry = "ReconcileStorageLedgerEntry",
  ReplayDeadLetterEvent = "ReplayDeadLetterEvent",
  SendTodoReminder = "SendTodoReminder",
}

export const azureFunctionSchema = z.enum(AzureFunction) satisfies z.ZodType<AzureFunction>;
