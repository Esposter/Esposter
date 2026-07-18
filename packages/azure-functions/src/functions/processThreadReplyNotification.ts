import { processThreadReplyNotificationHandler } from "@/handlers/processThreadReplyNotificationHandler";
import { app } from "@azure/functions";
import { AzureFunction } from "@esposter/db-schema";

app.eventGrid(AzureFunction.ProcessThreadReplyNotification, {
  handler: processThreadReplyNotificationHandler,
});

export default {};
