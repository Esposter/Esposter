import type { MessageEntity, NotificationOptions, PushNotificationEventGridData } from "@esposter/db-schema";

export const getPushNotificationData = (
  { message, partitionKey, rowKey, userId }: Pick<MessageEntity, "message" | "partitionKey" | "rowKey" | "userId">,
  notificationOptions: NotificationOptions,
): PushNotificationEventGridData => ({
  message: { message, partitionKey, rowKey, userId },
  notificationOptions,
});
