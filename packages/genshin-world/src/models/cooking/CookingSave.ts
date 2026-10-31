import { processingJobSaveSchema } from "#src/models/cooking/ProcessingJobSave";
import { numericSaveIdSchema } from "#src/models/save/numericSaveIdSchema";
import { MAX_COOKING_RECIPE_COUNT } from "#src/services/save/constants";
import { createRecordSchema, createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// The cooking as the save holds it: the ids of the dishes learned from instructions, each unique, each dish's proficiency
// By its id, and each processing's queue by its id
export const cookingSaveSchema = z.object({
  learnedRecipeIds: createUniqueArraySchema(z.int().positive()).max(MAX_COOKING_RECIPE_COUNT),
  processingJobs: createRecordSchema(numericSaveIdSchema, processingJobSaveSchema, MAX_COOKING_RECIPE_COUNT),
  proficiencies: createRecordSchema(numericSaveIdSchema, z.int().nonnegative(), MAX_COOKING_RECIPE_COUNT),
});

export type CookingSave = z.infer<typeof cookingSaveSchema>;
