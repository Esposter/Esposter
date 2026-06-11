import { processScheduledMessageJobHandler } from "@/handlers/processScheduledMessageJobHandler";
import { ProcessProperties } from "@/services/process";
import { app } from "@azure/functions";
import { AzureFunction, AzureQueue } from "@esposter/db-schema";

app.storageQueue(AzureFunction.ProcessScheduledMessageJob, {
  connection: ProcessProperties.AZURE_STORAGE_ACCOUNT_CONNECTION_STRING,
  handler: processScheduledMessageJobHandler,
  queueName: AzureQueue.ScheduledMessageJobs,
});

export default {};
