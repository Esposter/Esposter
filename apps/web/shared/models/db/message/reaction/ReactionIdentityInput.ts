import { roomIdSchema, roomReactionSchema } from "@esposter/db-schema";
import { z } from "zod";

// A reaction is one emoji on one message, addressed by the message's room and id and the emoji's tag
export const reactionIdentityInputSchema = z.object({
  ...roomIdSchema.shape,
  emojiTag: roomReactionSchema.shape.emojiTag,
  messageId: roomReactionSchema.shape.messageId,
});
export type ReactionIdentityInput = z.infer<typeof reactionIdentityInputSchema>;
