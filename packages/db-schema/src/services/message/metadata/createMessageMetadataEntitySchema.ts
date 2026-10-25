import { reverseTickedTimestampSchema } from "#src/models/azure/table/ReverseTickedTimestamp";
import { standardMessageEntitySchema } from "#src/models/message/StandardMessageEntity";
import { createAzureMetadataEntitySchema } from "#src/services/azure/table/createAzureMetadataEntitySchema";
import { z } from "zod";

export const createMessageMetadataEntitySchema = <T extends z.ZodType<string>>(typeSchema: T) =>
  z.object({
    ...createAzureMetadataEntitySchema(
      z.object({ partitionKey: standardMessageEntitySchema.shape.partitionKey, rowKey: reverseTickedTimestampSchema }),
      typeSchema,
    ).shape,
    messageRowKey: standardMessageEntitySchema.shape.rowKey,
  });
