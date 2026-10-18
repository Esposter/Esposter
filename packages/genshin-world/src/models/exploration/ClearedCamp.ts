import type { GroundPoint } from "genshin-engine";

import { groundPointSchema } from "#src/models/world/groundPointSchema";
import { MAX_SAVE_ID_LENGTH } from "#src/services/save/constants";
import { z } from "zod";

// A camp the player has cleared: the id the camp's data gives it, and the point it stands at, which is what places the
// Camp in its area. Kept so a camp cleared counts toward its area once, however often its enemies come back
export interface ClearedCamp {
  id: string;
  position: GroundPoint;
}

export const clearedCampSchema = z.object({
  id: z.string().min(1).max(MAX_SAVE_ID_LENGTH),
  position: groundPointSchema,
}) satisfies z.ZodType<ClearedCamp>;
