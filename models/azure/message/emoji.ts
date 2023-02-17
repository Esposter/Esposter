import { MessageMetadataEntity, messageMetadataSchema } from "@/models/azure/message/metadata";
import { userSchema } from "@/server/trpc/routers/user";
import type { toZod } from "tozod";
import { z } from "zod";

export class MessageEmojiMetadataEntity extends MessageMetadataEntity {
  emojiTag!: string;

  userIds!: string[];
}

export const messageEmojiMetadataSchema: toZod<MessageEmojiMetadataEntity> = messageMetadataSchema.merge(
  z.object({
    emojiTag: z.string(),
    userIds: z.array(userSchema.shape.id),
  })
);
