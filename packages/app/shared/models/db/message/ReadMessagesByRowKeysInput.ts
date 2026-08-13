import { roomIdSchema, standardMessageEntitySchema } from "@esposter/db-schema";
import { createUniqueArraySchema, MAX_READ_LIMIT } from "@esposter/shared";
import { z } from "zod";

export const readMessagesByRowKeysInputSchema = z.object({
  ...roomIdSchema.shape,
  rowKeys: createUniqueArraySchema(standardMessageEntitySchema.shape.rowKey).min(1).max(MAX_READ_LIMIT),
});
export type ReadMessagesByRowKeysInput = z.infer<typeof readMessagesByRowKeysInputSchema>;
