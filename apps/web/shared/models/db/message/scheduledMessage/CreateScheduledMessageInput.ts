import { roomIdSchema, roomMessageSchema, sanitizedMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

// A chat message to send later, from the room it is for, at the time it is due. The room's object sends it and applies
// The sender's rules when it comes due
export const createScheduledMessageInputSchema = z.object({
  message: sanitizedMessageSchema,
  replyToId: roomMessageSchema.shape.replyToId,
  ...roomIdSchema.shape,
  runAt: z.coerce.date(),
});
export type CreateScheduledMessageInput = z.infer<typeof createScheduledMessageInputSchema>;
