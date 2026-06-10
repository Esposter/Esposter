import { processFriendRequestNotification } from "@/handlers/processFriendRequestNotification";
import { app } from "@azure/functions";
import { AzureFunction } from "@esposter/db-schema";

app.eventGrid(AzureFunction.ProcessFriendRequestNotification, {
  handler: processFriendRequestNotification,
});

export default {};
