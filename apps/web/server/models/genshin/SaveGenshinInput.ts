import type { GenshinSave } from "genshin-world/save";

import { genshinSaveSchema } from "genshin-world/save";
import { z } from "zod";

export interface SaveGenshinInput {
  save: GenshinSave;
  sessionId: string;
}

export const saveGenshinInputSchema = z.object({
  save: genshinSaveSchema,
  sessionId: z.uuid(),
}) satisfies z.ZodType<SaveGenshinInput>;
