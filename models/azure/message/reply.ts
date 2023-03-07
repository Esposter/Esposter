import { messageSchema } from "@/models/azure/message";
import { MessageMetadataEntity, messageMetadataSchema } from "@/models/azure/message/metadata";
import { z } from "zod";

export class MessageReplyMetadataEntity extends MessageMetadataEntity {
  messageReplyRowKey!: string;
}

export const messageReplyMetadataSchema = messageMetadataSchema.merge(
  z.object({ messageReplyRowKey: messageSchema.shape.rowKey })
) satisfies z.ZodType<MessageReplyMetadataEntity>;
