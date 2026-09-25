import { selectResourceSchema } from "#src/schema/resources";
import { z } from "zod";

// The scheduled Service Bus message is the reminder's entire state — no Postgres row backs it
export interface TodoReminderQueueMessage {
  dueAt: Date;
  itemId: string;
  resourceId: string;
}
// The due date is coerced because the body round-trips through JSON in the queue (a Date becomes an ISO
// String)
export const todoReminderQueueMessageSchema = z.object({
  dueAt: z.coerce.date(),
  itemId: z.uuid(),
  resourceId: selectResourceSchema.shape.id,
}) satisfies z.ZodType<TodoReminderQueueMessage>;
