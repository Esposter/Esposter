import { MAX_BLUEPRINT_ENTRIES } from "#shared/services/resource/blueprint/constants";
import { selectResourceSchema } from "@esposter/db-schema";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

export const captureBlueprintInputSchema = z.object({
  ids: createUniqueArraySchema(selectResourceSchema.shape.id).min(1).max(MAX_BLUEPRINT_ENTRIES),
  name: selectResourceSchema.shape.name,
});

export type CaptureBlueprintInput = z.infer<typeof captureBlueprintInputSchema>;
