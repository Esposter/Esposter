import { CompositeKeyEntity } from "@/models/azure";
import { messageSchema } from "@/models/azure/message";
import { z } from "zod";

export enum MessageMetadataType {
  EmojiTag = "EmojiTag",
  Reply = "Reply",
}

export class MessageMetadataEntity extends CompositeKeyEntity {
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
