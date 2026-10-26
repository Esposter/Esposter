import type { TrounceBlossomSaveBase } from "#src/models/bosses/TrounceBlossomSaveBase";

import { trounceBlossomSaveBaseSchema } from "#src/models/bosses/TrounceBlossomSaveBase";
import { BlossomKind } from "#src/models/originalResin/BlossomKind";
import { z } from "zod";

export interface NormalTrounceBlossomSave extends TrounceBlossomSaveBase {
  kind: BlossomKind.NormalBoss;
  uniqueDropId: number;
}

export const normalTrounceBlossomSaveSchema = z.object({
  ...trounceBlossomSaveBaseSchema.shape,
  kind: z.literal(BlossomKind.NormalBoss),
  uniqueDropId: z.int(),
}) satisfies z.ZodType<NormalTrounceBlossomSave>;
