import { AzureEntity } from "@/models/azure";
import { messageSchema } from "@/models/esbabbler/message";
import { itemMetadataSchema } from "@/models/shared/ItemMetadata";
import { z } from "zod";

export enum MessageMetadataType {
  EmojiTag = "EmojiTag",
  Reply = "Reply",
}

export class MessageMetadataEntity extends AzureEntity {
  messageRowKey!: string;

  type!: MessageMetadataType;
}

export const messageMetadataSchema = z
  .object({
    partitionKey: messageSchema.shape.partitionKey,
    rowKey: z.string(),
    messageRowKey: messageSchema.shape.rowKey,
    type: z.nativeEnum(MessageMetadataType),
  })
  .merge(itemMetadataSchema) satisfies z.ZodType<MessageMetadataEntity>;
