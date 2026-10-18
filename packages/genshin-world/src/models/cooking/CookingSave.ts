import { processingJobSaveSchema } from "#src/models/cooking/ProcessingJobSave";
import { numericSaveIdSchema } from "#src/models/save/numericSaveIdSchema";
import { MAX_COOKING_RECIPE_COUNT } from "#src/services/save/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// The cooking as the save holds it: the ids of the dishes learned from instructions, each unique, each dish's proficiency
// By its id, and each processing's queue by its id, so a queue started on one copy and collected on the other is not lost
export const cookingSaveSchema = z.object({
  learnedRecipeIds: createUniqueArraySchema(z.int().positive()).max(MAX_COOKING_RECIPE_COUNT),
  processingJobs: z
    .record(numericSaveIdSchema, processingJobSaveSchema)
    .refine((jobMap) => Object.keys(jobMap).length <= MAX_COOKING_RECIPE_COUNT, "Too many processings"),
  proficiencies: z
    .record(numericSaveIdSchema, z.int().nonnegative())
    .refine((proficiencyMap) => Object.keys(proficiencyMap).length <= MAX_COOKING_RECIPE_COUNT, "Too many recipes"),
});

export type CookingSave = z.infer<typeof cookingSaveSchema>;
