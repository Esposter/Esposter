import { READ_RESOURCE_CONSUMERS_IDS_MAX_LENGTH } from "#shared/services/resource/constants";
import { selectResourceInResourceSchema } from "@esposter/db-schema";
import { createUniquePrimitiveArraySchema } from "@esposter/shared";
import { z } from "zod";

export const readResourceConsumersInputSchema = z.object({
  ids: createUniquePrimitiveArraySchema(selectResourceInResourceSchema.shape.id)
    .min(1)
    .max(READ_RESOURCE_CONSUMERS_IDS_MAX_LENGTH),
});
export type ReadResourceConsumersInput = z.infer<typeof readResourceConsumersInputSchema>;
