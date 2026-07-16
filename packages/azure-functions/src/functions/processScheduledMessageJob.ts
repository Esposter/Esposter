import { processScheduledMessageJobHandler } from "@/handlers/processScheduledMessageJobHandler";
import { ProcessProperties } from "@/services/process";
import { app } from "@azure/functions";
import { AzureFunction, AzureQueue } from "@esposter/db-schema";

app.serviceBusQueue(AzureFunction.ProcessScheduledMessageJob, {
  connection: ProcessProperties.AZURE_SERVICE_BUS_CONNECTION_STRING,
  handler: processScheduledMessageJobHandler,
  queueName: AzureQueue.ScheduledMessageJobs,
});

export default {};
