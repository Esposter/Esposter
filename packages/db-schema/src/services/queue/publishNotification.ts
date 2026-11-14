import type { NotificationQueueMessage } from "#src/models/queue/NotificationQueueMessage";
import type { QueueProducer } from "#src/models/queue/QueueProducer";

// The single publish path. Every notification in this system — a chat message, a thread reply, a friend request, a
// reminder, a resource operation — leaves its publisher through here, which is what puts all of them behind the one
// ProcessNotification queue and its one dead-letter queue ([notifications](openspec/specs/architecture/notifications/design.md)).
//
// The queue is a parameter because each Worker binds its own producer for it.
export const publishNotification = async (
  queue: QueueProducer<NotificationQueueMessage>,
  data: NotificationQueueMessage,
): Promise<void> => {
  await queue.send(data);
};
