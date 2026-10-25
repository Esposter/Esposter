import type { NotificationEventGridData } from "#src/models/azure/eventGrid/NotificationEventGridData";
import type { EventGridPublisherClient } from "@azure/eventgrid";

import { AzureFunction } from "#src/models/azure/function/AzureFunction";
import { createEventGridEvent } from "#src/services/azure/eventGrid/createEventGridEvent";
import { getNotificationSubject } from "#src/services/azure/eventGrid/getNotificationSubject";

// The single publish path. Every notification in this system — a chat message, a thread reply, a friend request, a
// Reminder, a resource operation — leaves its publisher through here, which is what puts all of them behind the
// One Function, the one dead-letter destination and the one replay
// ([dead-letter replay](openspec/specs/infra/eventgrid-dead-letter/design.md)).
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
