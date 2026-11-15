import { pageLimitSchema, roomIdSchema, roomMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

// A room opened at one of its messages: that message, and up to `limit` of the messages on each side of it
export const readMessagesAroundInputSchema = z.object({
  limit: pageLimitSchema,
  messageId: roomMessageSchema.shape.id,
  ...roomIdSchema.shape,
});
export type ReadMessagesAroundInput = z.input<typeof readMessagesAroundInputSchema>;
