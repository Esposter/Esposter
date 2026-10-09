import { MAX_CHARACTER_COUNT, MAX_SAVE_ID_LENGTH } from "#src/services/save/constants";
import { z } from "zod";

// Each character's Companionship EXP by its id, the total it has earned from which its Friendship Level is read
export const companionshipExpSaveSchema = z
  .record(z.string().min(1).max(MAX_SAVE_ID_LENGTH), z.int().nonnegative())
  .refine((expMap) => Object.keys(expMap).length <= MAX_CHARACTER_COUNT, "Too many characters");

export type CompanionshipExpSave = z.infer<typeof companionshipExpSaveSchema>;
