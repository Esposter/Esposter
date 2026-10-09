import {
  EMPTY_UNLOCKED_LANDMARK_SAVE,
  MAX_SAVE_ID_LENGTH,
  MAX_UNLOCKED_LANDMARK_COUNT,
} from "#src/services/save/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// The landmarks the player has resonated with, by their ids, each unique
export const unlockedLandmarkSaveSchema = createUniqueArraySchema(z.string().min(1).max(MAX_SAVE_ID_LENGTH))
  .max(MAX_UNLOCKED_LANDMARK_COUNT)
  .prefault(EMPTY_UNLOCKED_LANDMARK_SAVE);

export type UnlockedLandmarkSave = z.infer<typeof unlockedLandmarkSaveSchema>;
