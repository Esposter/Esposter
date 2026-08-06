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
  ReplayDeadLetterEvent = "ReplayDeadLetterEvent",
  SendTodoReminder = "SendTodoReminder",
  SettleStorageBlobs = "SettleStorageBlobs",
}

export const azureFunctionSchema = z.enum(AzureFunction);
