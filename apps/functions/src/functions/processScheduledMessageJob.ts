import { processScheduledMessageJobHandler } from "#src/handlers/processScheduledMessageJobHandler";
import { ProcessProperties } from "#src/services/process";
import { app } from "@azure/functions";
import { AzureFunction, AzureQueue } from "@esposter/db-schema";

app.serviceBusQueue(AzureFunction.ProcessScheduledMessageJob, {
  connection: ProcessProperties.AZURE_SERVICE_BUS_CONNECTION_STRING,
  handler: processScheduledMessageJobHandler,
  queueName: AzureQueue.ScheduledMessageJobs,
});

export default {};
