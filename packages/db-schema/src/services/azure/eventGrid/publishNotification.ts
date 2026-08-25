import type { NotificationEventGridData } from "#src/models/azure/eventGrid/NotificationEventGridData";
import type { EventGridPublisherClient } from "@azure/eventgrid";

import { AzureFunction } from "#src/models/azure/function/AzureFunction";
import { AppNotificationType } from "#src/models/notification/AppNotificationType";
import { createEventGridEvent } from "#src/services/azure/eventGrid/createEventGridEvent";
import { exhaustiveGuard } from "@esposter/shared";

// The subject of a notification event: what the notification is about, so a dead-letter blob or an Event Grid
// Metric reads as something other than an opaque id. Never used for filtering — the one subscription takes every
// Notification type — so it is free to say whatever identifies the occurrence best per type.
const getNotificationSubject = (data: NotificationEventGridData): string => {
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

// The single publish path. Every notification in this system — a chat message, a thread reply, a friend request, a
// Reminder, a resource operation — leaves its publisher through here, which is what puts all of them behind the
// One Function, the one dead-letter destination and the one replay ([dead-letter replay](/docs/infra/eventgrid-dead-letter)).
//
// The client is a parameter because the two callers authenticate differently: the app holds a topic key, the
// Functions host uses its managed identity. Neither difference belongs in the publish itself.
export const publishNotification = async (
  eventGridPublisherClient: Pick<EventGridPublisherClient<"EventGrid">, "send">,
  data: NotificationEventGridData,
): Promise<void> => {
  await eventGridPublisherClient.send([
    createEventGridEvent(AzureFunction.ProcessNotification, getNotificationSubject(data), data),
  ]);
};
