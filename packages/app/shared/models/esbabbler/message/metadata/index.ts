import { AzureEntity } from "@/shared/models/azure/AzureEntity";
import { messageSchema } from "@/shared/models/esbabbler/message";
import { itemMetadataSchema } from "@/shared/models/itemMetadata";
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
    messageRowKey: messageSchema.shape.rowKey,
    partitionKey: messageSchema.shape.partitionKey,
    rowKey: z.string(),
    type: z.nativeEnum(MessageMetadataType),
  })
  .merge(itemMetadataSchema) satisfies z.ZodType<MessageMetadataEntity>;
