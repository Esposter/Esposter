import { selectResourceInResourceSchema } from "@esposter/db-schema";
import { createUniqueArraySchema, MAX_READ_LIMIT } from "@esposter/shared";
import { z } from "zod";

export const readResourceConsumersInputSchema = z.object({
  ids: createUniqueArraySchema(selectResourceInResourceSchema.shape.id).min(1).max(MAX_READ_LIMIT),
});
export type ReadResourceConsumersInput = z.infer<typeof readResourceConsumersInputSchema>;
