import { MAX_BLUEPRINT_ENTRIES } from "#shared/services/resource/blueprint/constants";
import { selectResourceInResourceSchema } from "@esposter/db-schema";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

export const captureBlueprintInputSchema = z.object({
  ids: createUniqueArraySchema(selectResourceInResourceSchema.shape.id).min(1).max(MAX_BLUEPRINT_ENTRIES),
  name: selectResourceInResourceSchema.shape.name,
});
export type CaptureBlueprintInput = z.infer<typeof captureBlueprintInputSchema>;
