import { CompositeKeyEntity } from "@/models/azure";
import { messageSchema } from "@/models/azure/message";
import { MessageMetadataType } from "@/models/azure/message/metadata";
import type { toZod } from "tozod";
import { z } from "zod";

class MessageMetadataEntity extends CompositeKeyEntity {
  messageRowKey!: string;

  type!: MessageMetadataType;
}

// @NOTE: Add strict type, toZod<MessageMetadataEntity>
// once toZod supports native enums
export const messageMetadataSchema = z.object({
  partitionKey: messageSchema.shape.partitionKey,
  rowKey: z.string(),
  messageRowKey: messageSchema.shape.rowKey,
  type: z.nativeEnum(MessageMetadataType),
});

export class MessageEmojiMetadataEntity extends MessageMetadataEntity {
  emojiTag!: string;

  userIds!: string[];
}

export const messageEmojiMetadataSchema: toZod<MessageEmojiMetadataEntity> = messageMetadataSchema.merge(
  z.object({
    emojiTag: z.string(),
    userIds: z.array(z.string().cuid()),
  })
);
