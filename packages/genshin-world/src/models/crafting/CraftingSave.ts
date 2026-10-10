import { numericSaveIdSchema } from "#src/models/save/numericSaveIdSchema";
import { MAX_CRAFTING_RECIPE_COUNT } from "#src/services/save/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// The bench's crafting as the save holds it: the ids of the recipes learned from instructions, each unique, and how many
// Of each recipe the player has crafted, by the recipe's id
export const craftingSaveSchema = z.object({
  craftedCounts: z
    .record(numericSaveIdSchema, z.int().positive())
    .refine((countMap) => Object.keys(countMap).length <= MAX_CRAFTING_RECIPE_COUNT, "Too many recipes"),
  learnedRecipeIds: createUniqueArraySchema(z.int().positive()).max(MAX_CRAFTING_RECIPE_COUNT),
});

export type CraftingSave = z.infer<typeof craftingSaveSchema>;
