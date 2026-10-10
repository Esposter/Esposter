import { numericSaveIdSchema } from "#src/models/save/numericSaveIdSchema";
import { MAX_CHARACTER_COUNT } from "#src/services/save/constants";
import { z } from "zod";

// Each character's Companionship EXP by its id, the total it has earned from which its Friendship Level is read
export const companionshipExpSaveSchema = z
  .record(numericSaveIdSchema, z.int().nonnegative())
  .refine((expMap) => Object.keys(expMap).length <= MAX_CHARACTER_COUNT, "Too many characters");

export type CompanionshipExpSave = z.infer<typeof companionshipExpSaveSchema>;
