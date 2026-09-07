import { processNotificationHandler } from "#src/handlers/processNotificationHandler";
import { app } from "@azure/functions";
import { AzureFunction } from "@esposter/db-schema";

app.eventGrid(AzureFunction.ProcessNotification, {
  handler: processNotificationHandler,
});

export default {};
