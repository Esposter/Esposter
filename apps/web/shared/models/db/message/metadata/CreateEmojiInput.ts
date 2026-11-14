import type { z } from "zod";
import { messageEmojiMetadataEntitySchema } from "@esposter/db-schema";

export const createEmojiInputSchema = messageEmojiMetadataEntitySchema.pick({
  emojiTag: true,
  messageRowKey: true,
  partitionKey: true,
});
export type CreateEmojiInput = z.infer<typeof createEmojiInputSchema>;
