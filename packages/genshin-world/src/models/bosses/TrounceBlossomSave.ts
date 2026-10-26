import type { NormalTrounceBlossomSave } from "#src/models/bosses/NormalTrounceBlossomSave";
import type { WeeklyTrounceBlossomSave } from "#src/models/bosses/WeeklyTrounceBlossomSave";

import { normalTrounceBlossomSaveSchema } from "#src/models/bosses/NormalTrounceBlossomSave";
import { weeklyTrounceBlossomSaveSchema } from "#src/models/bosses/WeeklyTrounceBlossomSave";
import { z } from "zod";

export type TrounceBlossomSave = NormalTrounceBlossomSave | WeeklyTrounceBlossomSave;

export const trounceBlossomSaveSchema = z.discriminatedUnion("kind", [
  normalTrounceBlossomSaveSchema,
  weeklyTrounceBlossomSaveSchema,
]) satisfies z.ZodType<TrounceBlossomSave>;
