import { AzureEntity } from "#shared/models/azure/AzureEntity";
import { itemMetadataSchema } from "#shared/models/entity/ItemMetadata";
import { messageEntitySchema } from "#shared/models/esbabbler/message/MessageEntity";
import { MessageMetadataType } from "#shared/models/esbabbler/message/metadata/MessageMetadataType";
import { z } from "zod";

export class MessageMetadataEntity extends AzureEntity {
  messageRowKey!: string;

  type!: MessageMetadataType;
}

export const messageMetadataEntitySchema = z
  .object({
    messageRowKey: messageEntitySchema.shape.rowKey,
    partitionKey: messageEntitySchema.shape.partitionKey,
    rowKey: z.string(),
    type: z.nativeEnum(MessageMetadataType),
  })
  .merge(itemMetadataSchema) satisfies z.ZodType<MessageMetadataEntity>;
