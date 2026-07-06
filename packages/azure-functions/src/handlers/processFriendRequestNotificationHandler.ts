import type { EventGridHandler } from "@azure/functions";

import { createEventGridNotificationHandler } from "@/handlers/createEventGridNotificationHandler";
import { sendFriendRequestNotification } from "@/services/sendFriendRequestNotification";
import { AzureFunction, friendRequestNotificationEventGridDataSchema } from "@esposter/db-schema";

export const processFriendRequestNotificationHandler: EventGridHandler = createEventGridNotificationHandler(
  AzureFunction.ProcessFriendRequestNotification,
  friendRequestNotificationEventGridDataSchema,
  sendFriendRequestNotification,
  (data) => `Successfully processed friend request notification for user ${data.receiverId}.`,
);
