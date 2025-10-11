import type { MessageMetadataType } from "@/models/message/metadata/MessageMetadataType";

import { AzureMetadataEntity, createAzureMetadataEntitySchema } from "@/models/azure/table/AzureMetadataEntity";
import { baseMessageEntitySchema } from "@/models/message/BaseMessageEntity";
import { z } from "zod";

export abstract class MessageMetadataEntity<TType extends MessageMetadataType> extends AzureMetadataEntity<TType> {
  messageRowKey!: string;
}

export const createMessageMetadataEntitySchema = <T extends z.ZodType<string>>(typeSchema: T) =>
  z.object({
    ...createAzureMetadataEntitySchema(
      z.object({
        partitionKey: baseMessageEntitySchema.shape.partitionKey,
        rowKey: z.string(),
      }),
      typeSchema,
    ).shape,
    messageRowKey: baseMessageEntitySchema.shape.rowKey,
  });
