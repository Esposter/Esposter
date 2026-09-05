import { selectResourceSchema } from "#src/schema/resources";
import { z } from "zod";

// The scheduled Service Bus message is the reminder's entire state — no Postgres row backs it.
// The due date is coerced because the body round-trips through JSON in the queue (a Date becomes an ISO
// String).
export const todoReminderQueueMessageSchema = z.object({
  dueAt: z.coerce.date(),
  itemId: z.uuid(),
  resourceId: selectResourceSchema.shape.id,
});
export type TodoReminderQueueMessage = z.infer<typeof todoReminderQueueMessageSchema>;
