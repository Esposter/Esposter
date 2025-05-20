import type { MessageMetadataType } from "#shared/models/db/message/metadata/MessageMetadataType";

import { AzureMetadataEntity, createAzureMetadataEntitySchema } from "#shared/models/azure/AzureMetadataEntity";
import { messageEntitySchema } from "#shared/models/db/message/MessageEntity";
import { z } from "zod/v4";

export abstract class MessageMetadataEntity<TType extends MessageMetadataType> extends AzureMetadataEntity<TType> {
  messageRowKey!: string;
}

export const createMessageMetadataEntitySchema = <TType extends string>(typeSchema: z.ZodType<TType>) =>
  createAzureMetadataEntitySchema(
    z.object({
      partitionKey: messageEntitySchema.shape.partitionKey,
      rowKey: z.string(),
    }),
    typeSchema,
  ).extend(
    z.object({
      messageRowKey: messageEntitySchema.shape.rowKey,
    }),
  );
