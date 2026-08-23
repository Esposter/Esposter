import { processPushNotificationHandler } from "#src/handlers/processPushNotificationHandler";
import { app } from "@azure/functions";
import { AzureFunction } from "@esposter/db-schema";

app.eventGrid(AzureFunction.ProcessPushNotification, {
  handler: processPushNotificationHandler,
});

export default {};
