import type { EventGridHandler } from "@azure/functions";

import { sendFriendRequestNotification } from "@/services/sendFriendRequestNotification";
import { AzureFunction, friendRequestNotificationEventGridDataSchema } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

export const processFriendRequestNotificationHandler: EventGridHandler = (event, context) => {
  context.log(`${AzureFunction.ProcessFriendRequestNotification} processed message: `, event.data);
  return getResultAsync(async () => {
    const data = friendRequestNotificationEventGridDataSchema.parse(event.data);
    await sendFriendRequestNotification(context, data);
    context.log(`Successfully processed friend request notification for user ${data.receiverId}.`);
  }).match(noop, (error) => {
    context.error(`${AzureFunction.ProcessFriendRequestNotification} failed: `, error);
    throw error;
  });
};
