import { messageSchema } from "@/models/azure/message";
import type { MessageEmojiMetadataEntity } from "@/models/azure/message/emoji";
import { router } from "@/server/trpc";
import { getRoomUserProcedure } from "@/server/trpc/procedure";
import { createEmojiMetadataEntity } from "@/services/azure/emoji";
import { unemojify } from "node-emoji";
import { z } from "zod";

const createEmojiInputSchema = messageSchema
  .pick({ partitionKey: true })
  .merge(z.object({ messageMetadataRowKey: z.string(), messageRowKey: z.string(), emoji: z.string() }));
export type createEmojiInput = z.infer<typeof createEmojiInputSchema>;

export const emojiRouter = router({
  createEmoji: getRoomUserProcedure(createEmojiInputSchema, "partitionKey")
    .input(createEmojiInputSchema)
    .mutation(async ({ input: { partitionKey, messageMetadataRowKey, messageRowKey, emoji }, ctx }) => {
      const newEmojiMetadataEntity: MessageEmojiMetadataEntity = {
        partitionKey,
        rowKey: messageMetadataRowKey,
        emojiTag: unemojify(emoji),
        userIds: [ctx.session.user.id],
      };
      await createEmojiMetadataEntity(newEmojiMetadataEntity, messageRowKey);
      return newEmojiMetadataEntity;
    }),
});
