import { z } from "zod";

// An emoji row of the legacy MessagesMetadata table: one emoji on one message, and the members who chose it
export const legacyMessageEmojiSchema = z.object({
  emojiTag: z.string(),
  messageRowKey: z.string(),
  partitionKey: z.string(),
  rowKey: z.string(),
  userIds: z.array(z.string()).optional(),
});
export type LegacyMessageEmoji = z.infer<typeof legacyMessageEmojiSchema>;
