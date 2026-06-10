import { processScheduledMessageJob } from "@/handlers/processScheduledMessageJob";
import { app } from "@azure/functions";
import { AzureFunction, AzureQueue } from "@esposter/db-schema";

app.storageQueue(AzureFunction.ProcessScheduledMessageJob, {
  connection: "AZURE_STORAGE_ACCOUNT_CONNECTION_STRING",
  handler: processScheduledMessageJob,
  queueName: AzureQueue.ScheduledMessageJobs,
});

export default {};
