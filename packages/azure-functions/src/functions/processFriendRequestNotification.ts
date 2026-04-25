import type { FriendRequestNotificationEventGridData } from "@esposter/db-schema";

import { friendRequestNotification } from "@/services/friendRequestNotification";
import { app } from "@azure/functions";
import { AzureFunction } from "@esposter/db-schema";

app.eventGrid(AzureFunction.ProcessFriendRequestNotification, {
  handler: async (event, context) => {
    context.log(`${AzureFunction.ProcessFriendRequestNotification} processed message: `, event.data);
    const data = event.data as unknown as FriendRequestNotificationEventGridData;

    try {
      await friendRequestNotification(context, data);
      context.log(`Successfully processed friend request notification for user ${data.receiverId}.`);
    } catch (error) {
      context.error(`Failed to process friend request notification for user ${data.receiverId}: `, error);
      throw error;
    }
  },
});

export default {};
