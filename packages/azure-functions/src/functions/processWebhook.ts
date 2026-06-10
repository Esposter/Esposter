import { processWebhookHandler } from "@/handlers/processWebhookHandler";
import { app } from "@azure/functions";
import { AzureFunction } from "@esposter/db-schema";

app.eventGrid(AzureFunction.ProcessWebhook, {
  handler: processWebhookHandler,
});

export default {};
