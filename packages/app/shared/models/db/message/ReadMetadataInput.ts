import { roomIdSchema, standardMessageEntitySchema } from "@esposter/db-schema";
import { MAX_READ_LIMIT } from "@esposter/shared";
import { z } from "zod";

export const readMetadataInputSchema = z.object({
  messageRowKeys: standardMessageEntitySchema.shape.rowKey.array().min(1).max(MAX_READ_LIMIT),
  ...roomIdSchema.shape,
});
export type ReadMetadataInput = z.infer<typeof readMetadataInputSchema>;
