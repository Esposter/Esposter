import { roomIdSchema, standardMessageEntitySchema } from "@esposter/db-schema";
import { z } from "zod";

export const onCreateMessageInputSchema = z.object({
  // The rowKey of the last message the client was yielded, which the subscription tracks its events by
  lastEventId: standardMessageEntitySchema.shape.rowKey.optional(),
  ...roomIdSchema.shape,
});
export type OnCreateMessageInput = z.infer<typeof onCreateMessageInputSchema>;
