import { MAX_FORGE_RECIPE_COUNT } from "#src/services/save/constants";
import { createUniquePrimitiveArraySchema } from "@esposter/shared";
import { z } from "zod";

// The blacksmith's forge as the save holds it: the ids of the recipes learned from diagrams, each unique
export const forgingSaveSchema = z.object({
  learnedRecipeIds: createUniquePrimitiveArraySchema(z.int().positive()).max(MAX_FORGE_RECIPE_COUNT),
});

export type ForgingSave = z.infer<typeof forgingSaveSchema>;
