import { numericSaveIdSchema } from "#src/models/save/numericSaveIdSchema";
import { MAX_CHARACTER_COUNT } from "#src/services/save/constants";
import { createRecordSchema } from "@esposter/shared";
import { z } from "zod";

// Each character's Companionship EXP by its id, the total it has earned from which its Friendship Level is read
export const companionshipExpSaveSchema = createRecordSchema(
  numericSaveIdSchema,
  z.int().nonnegative(),
  MAX_CHARACTER_COUNT,
);

export type CompanionshipExpSave = z.infer<typeof companionshipExpSaveSchema>;
