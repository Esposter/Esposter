import type { ToData } from "#shared/models/entity/ToData";

import { AzureEntity } from "#shared/models/azure/AzureEntity";
import { messageEntitySchema } from "#shared/models/db/message/MessageEntity";
import { MessageMetadataType } from "#shared/models/db/message/metadata/MessageMetadataType";
import { itemMetadataSchema } from "#shared/models/entity/ItemMetadata";
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
  .merge(itemMetadataSchema) satisfies z.ZodType<ToData<MessageMetadataEntity>>;
