import type { NotificationEventGridData } from "#src/models/azure/eventGrid/NotificationEventGridData";

import { AppNotificationType } from "#src/models/notification/AppNotificationType";
import { exhaustiveGuard } from "@esposter/shared";

// The subject of a notification event: what the notification is about, so a dead-letter blob or an Event Grid
// Metric reads as something other than an opaque id. Never used for filtering — the one subscription takes every
// Notification type — so it is free to say whatever identifies the occurrence best per type.
export const getNotificationSubject = (data: NotificationEventGridData): string => {
  switch (data.type) {
    case AppNotificationType.FriendRequest:
      return `${data.type}/${data.receiverId}`;
    case AppNotificationType.Message:
      return `${data.type}/${data.message.partitionKey}/${data.message.rowKey}`;
    case AppNotificationType.Reminder:
      return `${data.type}/${data.roomId}/${data.userId}`;
    case AppNotificationType.ResourceOperation:
      return `${data.type}/${data.userId}`;
    case AppNotificationType.TodoReminder:
      return `${data.type}/${data.resourceId}`;
    default:
      return exhaustiveGuard(data);
  }
};
