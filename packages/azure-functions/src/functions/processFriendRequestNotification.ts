import { processFriendRequestNotificationHandler } from "@/handlers/processFriendRequestNotificationHandler";
import { app } from "@azure/functions";
import { AzureFunction } from "@esposter/db-schema";

app.eventGrid(AzureFunction.ProcessFriendRequestNotification, {
  handler: processFriendRequestNotificationHandler,
});

export default {};
