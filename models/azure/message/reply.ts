import { messageSchema } from "@/models/azure/message";
import { MessageMetadataEntity, messageMetadataSchema } from "@/models/azure/message/metadata";
import type { toZod } from "tozod";
import { z } from "zod";

export class MessageReplyMetadataEntity extends MessageMetadataEntity {
  messageReplyRowKey!: string;
}

export const messageReplyMetadataSchema: toZod<MessageReplyMetadataEntity> = messageMetadataSchema.merge(
  z.object({
    messageReplyRowKey: messageSchema.shape.message,
  })
);
