import { z } from "zod";

export enum AzureFunction {
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

export const azureFunctionSchema = z.enum(AzureFunction) satisfies z.ZodType<AzureFunction>;
