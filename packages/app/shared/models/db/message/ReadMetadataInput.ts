import { roomIdSchema, standardMessageEntitySchema } from "@esposter/db-schema";
import { createUniqueArraySchema, MAX_READ_LIMIT } from "@esposter/shared";
import { z } from "zod";

export const readMetadataInputSchema = z.object({
  messageRowKeys: createUniqueArraySchema(standardMessageEntitySchema.shape.rowKey).min(1).max(MAX_READ_LIMIT),
  ...roomIdSchema.shape,
});
export type ReadMetadataInput = z.infer<typeof readMetadataInputSchema>;
