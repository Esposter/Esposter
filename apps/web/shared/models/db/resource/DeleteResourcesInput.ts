import { selectResourceInResourceSchema } from "@esposter/db-schema";
import { createIdBatchSchema } from "@esposter/shared";
import { z } from "zod";

export const deleteResourcesInputSchema = z.object({
  ids: createIdBatchSchema(selectResourceInResourceSchema.shape.id),
});
export type DeleteResourcesInput = z.infer<typeof deleteResourcesInputSchema>;
