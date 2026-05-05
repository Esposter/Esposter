import type { FriendRequestNotificationEventGridData } from "@esposter/db-schema";

import { friendRequestNotification } from "@/services/friendRequestNotification";
import { app } from "@azure/functions";
import { AzureFunction } from "@esposter/db-schema";
import { toAppError } from "@esposter/shared";
import { ResultAsync } from "neverthrow";

app.eventGrid(AzureFunction.ProcessFriendRequestNotification, {
  handler: (event, context) => {
    context.log(`${AzureFunction.ProcessFriendRequestNotification} processed message: `, event.data);
    const data = event.data as unknown as FriendRequestNotificationEventGridData;
    return ResultAsync.fromPromise(friendRequestNotification(context, data), toAppError).match(
      () => {
        context.log(`Successfully processed friend request notification for user ${data.receiverId}.`);
      },
      (error) => {
        context.error(`Failed to process friend request notification for user ${data.receiverId}: `, error);
        throw error;
      },
    );
  },
});

export default {};
