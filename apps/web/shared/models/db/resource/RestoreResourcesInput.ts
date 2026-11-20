import { selectResourceInResourceSchema } from "@esposter/db-schema";
import { createIdBatchSchema } from "@esposter/shared";
import { z } from "zod";

export const restoreResourcesInputSchema = z.object({
  ids: createIdBatchSchema(selectResourceInResourceSchema.shape.id),
});
export type RestoreResourcesInput = z.infer<typeof restoreResourcesInputSchema>;
