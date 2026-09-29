import { selectResourceInResourceSchema } from "@esposter/db-schema";
import { createUniqueArraySchema, MAX_READ_LIMIT } from "@esposter/shared";
import { z } from "zod";

export const restoreResourcesInputSchema = z.object({
  ids: createUniqueArraySchema(selectResourceInResourceSchema.shape.id).min(1).max(MAX_READ_LIMIT),
});
export type RestoreResourcesInput = z.infer<typeof restoreResourcesInputSchema>;
