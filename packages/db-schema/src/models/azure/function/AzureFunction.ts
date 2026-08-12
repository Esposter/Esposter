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
  ReconcileStorageBlob = "ReconcileStorageBlob",
  ReplayDeadLetterEvent = "ReplayDeadLetterEvent",
  SendTodoReminder = "SendTodoReminder",
}

export const azureFunctionSchema = z.enum(AzureFunction) satisfies z.ZodType<AzureFunction>;
