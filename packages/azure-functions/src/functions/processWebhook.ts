import { processWebhook } from "@/handlers/processWebhook";
import { app } from "@azure/functions";
import { AzureFunction } from "@esposter/db-schema";

app.eventGrid(AzureFunction.ProcessWebhook, {
  handler: processWebhook,
});

export default {};
