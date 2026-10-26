import type { TrounceBlossomSaveBase } from "#src/models/bosses/TrounceBlossomSaveBase";

import { trounceBlossomSaveBaseSchema } from "#src/models/bosses/TrounceBlossomSaveBase";
import { BlossomKind } from "#src/models/originalResin/BlossomKind";
import { z } from "zod";

export interface WeeklyTrounceBlossomSave extends TrounceBlossomSaveBase {
  kind: BlossomKind.WeeklyBoss;
}

export const weeklyTrounceBlossomSaveSchema = z.object({
  ...trounceBlossomSaveBaseSchema.shape,
  kind: z.literal(BlossomKind.WeeklyBoss),
}) satisfies z.ZodType<WeeklyTrounceBlossomSave>;
