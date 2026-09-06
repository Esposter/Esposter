import { selectResourceSchema } from "@esposter/db-schema";
import { createUniqueArraySchema, MAX_READ_LIMIT } from "@esposter/shared";
import { z } from "zod";

export const deleteResourcesInputSchema = z.object({
  ids: createUniqueArraySchema(selectResourceSchema.shape.id).min(1).max(MAX_READ_LIMIT),
});
export type DeleteResourcesInput = z.infer<typeof deleteResourcesInputSchema>;
