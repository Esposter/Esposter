import { z } from "zod";

export enum AzureFunction {
  ProcessFriendRequestNotification = "ProcessFriendRequestNotification",
  ProcessPushNotification = "ProcessPushNotification",
  ProcessScheduledMessageJob = "ProcessScheduledMessageJob",
  ProcessThreadReplyNotification = "ProcessThreadReplyNotification",
  ProcessWebhook = "ProcessWebhook",
  PurgeDeletedResources = "PurgeDeletedResources",
  PushWebhook = "PushWebhook",
  ReplayDeadLetterEvent = "ReplayDeadLetterEvent",
  SendTodoReminder = "SendTodoReminder",
}

export const azureFunctionSchema = z.enum(AzureFunction);
