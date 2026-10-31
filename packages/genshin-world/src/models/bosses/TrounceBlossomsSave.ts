import type { TrounceBlossomSave } from "#src/models/bosses/TrounceBlossomSave";

import { trounceBlossomSaveSchema } from "#src/models/bosses/TrounceBlossomSave";
import { MAX_SAVE_ID_LENGTH, MAX_TROUNCE_BLOSSOM_COUNT } from "#src/services/save/constants";
import { createRecordSchema } from "@esposter/shared";
import { z } from "zod";

// The blossoms the defeated bosses left, each by the spawn key its boss fell under
export type TrounceBlossomsSave = Record<string, TrounceBlossomSave>;

export const trounceBlossomsSaveSchema = createRecordSchema(
  z.string().min(1).max(MAX_SAVE_ID_LENGTH),
  trounceBlossomSaveSchema,
  MAX_TROUNCE_BLOSSOM_COUNT,
) satisfies z.ZodType<TrounceBlossomsSave>;
