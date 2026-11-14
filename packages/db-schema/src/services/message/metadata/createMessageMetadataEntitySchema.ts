import { reverseTickedTimestampSchema } from "#src/models/message/ReverseTickedTimestamp";
import { standardMessageEntitySchema } from "#src/models/message/StandardMessageEntity";
import { itemMetadataSchema } from "#src/models/shared/ItemMetadata";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

// A metadata row is keyed by its message's room and its own countdown, and names the message it belongs to
export const createMessageMetadataEntitySchema = <T extends z.ZodType<string>>(typeSchema: T) =>
  z.object({
    partitionKey: standardMessageEntitySchema.shape.partitionKey,
    rowKey: reverseTickedTimestampSchema,
    ...itemMetadataSchema.shape,
    ...createItemEntityTypeSchema(typeSchema).shape,
    messageRowKey: standardMessageEntitySchema.shape.rowKey,
  });
