import { selectResourceSchema } from "@/schema/resources";
import { z } from "zod";

// The scheduled Service Bus message is the reminder's entire state — no Postgres row backs it.
// DueAt is coerced because the body round-trips through JSON in the queue (Date becomes an ISO string).
export const todoReminderQueueMessageSchema = z.object({
  dueAt: z.coerce.date(),
  itemId: z.uuid(),
  resourceId: selectResourceSchema.shape.id,
});
export type TodoReminderQueueMessage = z.infer<typeof todoReminderQueueMessageSchema>;
