import type { TrounceBlossomSave } from "#src/models/bosses/TrounceBlossomSave";

import { trounceBlossomSaveSchema } from "#src/models/bosses/TrounceBlossomSave";
import { MAX_SAVE_ID_LENGTH, MAX_TROUNCE_BLOSSOM_COUNT } from "#src/services/save/constants";
import { z } from "zod";

// The blossoms the defeated bosses left, each by the spawn key its boss fell under
export type TrounceBlossomsSave = Record<string, TrounceBlossomSave>;

export const trounceBlossomsSaveSchema = z
  .record(z.string().min(1).max(MAX_SAVE_ID_LENGTH), trounceBlossomSaveSchema)
  .refine((trounceBlossomMap) => Object.keys(trounceBlossomMap).length <= MAX_TROUNCE_BLOSSOM_COUNT, {
    error: "Too many Trounce Blossoms",
  }) satisfies z.ZodType<TrounceBlossomsSave>;
