import { messageSchema } from "@/models/azure/message";
import { MessageMetadataEntity, messageMetadataSchema } from "@/models/azure/message/metadata";
import type { toZod } from "tozod";
import { z } from "zod";

export class MessageReplyMetadataEntity extends MessageMetadataEntity {
  reply!: string;
}

export const messageReplyMetadataSchema: toZod<MessageReplyMetadataEntity> = messageMetadataSchema.merge(
  z.object({
    reply: messageSchema.shape.message,
  })
);
