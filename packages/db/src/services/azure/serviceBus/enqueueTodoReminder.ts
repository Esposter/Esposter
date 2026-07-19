import type { ServiceBusSender } from "@azure/service-bus";
import type { TodoReminderQueueMessage } from "@esposter/db-schema";

import { todoReminderQueueMessageSchema } from "@esposter/db-schema";

// Service Bus delivers messages scheduled in the past immediately, so dueAt needs no clamping.
export const enqueueTodoReminder = async (
  serviceBusSender: ServiceBusSender,
  message: TodoReminderQueueMessage,
): Promise<void> => {
  await serviceBusSender.scheduleMessages({ body: todoReminderQueueMessageSchema.parse(message) }, message.dueAt);
};
