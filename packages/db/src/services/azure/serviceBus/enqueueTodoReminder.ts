import type { ServiceBusSender } from "@azure/service-bus";
import type { TodoReminderQueueMessage } from "@esposter/db-schema";

import { todoReminderQueueMessageSchema } from "@esposter/db-schema";

// Service Bus delivers messages scheduled in the past immediately, so dueAt needs no clamping.
// The deterministic messageId pairs with the queue's duplicate detection so re-enqueueing the same
// (item, dueAt) — e.g. a due date toggled away and back across saves — collapses to one reminder.
export const enqueueTodoReminder = async (
  serviceBusSender: ServiceBusSender,
  message: TodoReminderQueueMessage,
): Promise<void> => {
  await serviceBusSender.scheduleMessages(
    {
      body: todoReminderQueueMessageSchema.parse(message),
      messageId: `${message.resourceId}-${message.itemId}-${message.dueAt.getTime()}`,
    },
    message.dueAt,
  );
};
