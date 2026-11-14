import { z } from "zod";

// The members who chose one emoji on one message. One row holds every reactor to that emoji, so the row is the reaction
export const roomReactionSchema = z.object({
  emojiTag: z.string().min(1),
  messageId: z.number().int().positive(),
  userIds: z.array(z.string()),
});
export type RoomReaction = z.infer<typeof roomReactionSchema>;
