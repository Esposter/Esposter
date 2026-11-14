import { emojiTagSchema } from "#src/models/message/emoji/EmojiTag";
import { messageEmojisInRoom } from "#src/objects/room/schema";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

// The members who chose one emoji on one message. One row holds every reactor to that emoji, so the row is the reaction
export const roomReactionSchema = createSelectSchema(messageEmojisInRoom, {
  emojiTag: () => emojiTagSchema,
  messageId: (schema) => schema.positive(),
  userIds: () => z.array(z.string()),
});
export type RoomReaction = z.infer<typeof roomReactionSchema>;
