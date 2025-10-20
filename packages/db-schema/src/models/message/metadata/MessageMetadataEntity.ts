import type { MessageMetadataType } from "@/models/message/metadata/MessageMetadataType";

import { AzureMetadataEntity, createAzureMetadataEntitySchema } from "@/models/azure/table/AzureMetadataEntity";
import { standardMessageEntitySchema } from "@/models/message/StandardMessageEntity";
import { z } from "zod";

export abstract class MessageMetadataEntity<TType extends MessageMetadataType> extends AzureMetadataEntity<TType> {
  messageRowKey!: string;
}

export const createMessageMetadataEntitySchema = <T extends z.ZodType<string>>(typeSchema: T) =>
  z.object({
    ...createAzureMetadataEntitySchema(
      z.object({
        partitionKey: standardMessageEntitySchema.shape.partitionKey,
        rowKey: z.string(),
      }),
      typeSchema,
    ).shape,
    messageRowKey: standardMessageEntitySchema.shape.rowKey,
  });
