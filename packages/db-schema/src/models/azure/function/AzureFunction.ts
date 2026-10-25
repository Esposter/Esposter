import { z } from "zod";

export enum AzureFunction {
  DeleteAccount = "DeleteAccount",
  DeleteOrphanedProfileImage = "DeleteOrphanedProfileImage",
  ProcessBlobDeletion = "ProcessBlobDeletion",
  ProcessNotification = "ProcessNotification",
  ProcessScheduledMessageJob = "ProcessScheduledMessageJob",
  ProcessWebhook = "ProcessWebhook",
  PurgeDeletedResources = "PurgeDeletedResources",
  PurgeSurveyResources = "PurgeSurveyResources",
  PushWebhook = "PushWebhook",
  ReconcileStorageLedgerEntry = "ReconcileStorageLedgerEntry",
  ReplayDeadLetterEvent = "ReplayDeadLetterEvent",
  SendTodoReminder = "SendTodoReminder",
}

export const azureFunctionSchema = z.enum(AzureFunction) satisfies z.ZodType<AzureFunction>;
