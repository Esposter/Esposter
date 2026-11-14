import { z } from "zod";

export const AzureFunction = {
  DeleteAccount: "DeleteAccount",
  DeleteOrphanedProfileImage: "DeleteOrphanedProfileImage",
  ExportUserData: "ExportUserData",
  ProcessBlobDeletion: "ProcessBlobDeletion",
  ProcessNotification: "ProcessNotification",
  ProcessScheduledMessageJob: "ProcessScheduledMessageJob",
  ProcessWebhook: "ProcessWebhook",
  PurgeDeletedResources: "PurgeDeletedResources",
  PushWebhook: "PushWebhook",
  ReconcileStorageLedgerEntry: "ReconcileStorageLedgerEntry",
  ReplayDeadLetterEvent: "ReplayDeadLetterEvent",
  SendTodoReminder: "SendTodoReminder",
} as const;
export type AzureFunction = (typeof AzureFunction)[keyof typeof AzureFunction];

export const azureFunctionSchema = z.enum(AzureFunction) satisfies z.ZodType<AzureFunction>;
