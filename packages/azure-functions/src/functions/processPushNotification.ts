import { processPushNotification } from "@/handlers/processPushNotification";
import { app } from "@azure/functions";
import { AzureFunction } from "@esposter/db-schema";

app.eventGrid(AzureFunction.ProcessPushNotification, {
  handler: processPushNotification,
});

export default {};
