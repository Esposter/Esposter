import type { MessageMetadataType } from "#shared/models/db/message/metadata/MessageMetadataType";

import { AzureMetadataEntity, createAzureMetadataEntitySchema } from "#shared/models/azure/AzureMetadataEntity";
import { messageEntitySchema } from "#shared/models/db/message/MessageEntity";
import { z } from "zod";

export abstract class MessageMetadataEntity<TType extends MessageMetadataType> extends AzureMetadataEntity<TType> {
  messageRowKey!: string;
}

export const createMessageMetadataEntitySchema = <T extends z.ZodType<string>>(typeSchema: T) =>
  z.object({
    ...createAzureMetadataEntitySchema(
      z.object({
        partitionKey: messageEntitySchema.shape.partitionKey,
        rowKey: z.string(),
      }),
      typeSchema,
    ).shape,
    messageRowKey: messageEntitySchema.shape.rowKey,
  });
