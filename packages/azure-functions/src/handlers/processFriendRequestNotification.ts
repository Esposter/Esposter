import type { EventGridHandler } from "@azure/functions";
import type { FriendRequestNotificationEventGridData } from "@esposter/db-schema";

import { sendFriendRequestNotification } from "@/services/sendFriendRequestNotification";
import { AzureFunction } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";

export const processFriendRequestNotification: EventGridHandler = (event, context) => {
  context.log(`${AzureFunction.ProcessFriendRequestNotification} processed message: `, event.data);
  const data = event.data as unknown as FriendRequestNotificationEventGridData;
  return getResultAsync(() => sendFriendRequestNotification(context, data)).match(
    () => {
      context.log(`Successfully processed friend request notification for user ${data.receiverId}.`);
    },
    (error) => {
      context.error(`Failed to process friend request notification for user ${data.receiverId}: `, error);
      throw error;
    },
  );
};
