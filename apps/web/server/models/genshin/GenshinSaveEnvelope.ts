import type { GenshinSave } from "genshin-world/save";

import { genshinSaveSchema } from "genshin-world/save";
import { z } from "zod";

// The Genshin blob: the save and the session that holds it, so the one blob's ETag covers both the save and the lease
export interface GenshinSaveEnvelope {
  save: GenshinSave;
  sessionId: string;
}

export const genshinSaveEnvelopeSchema = z.object({
  save: genshinSaveSchema,
  sessionId: z.uuid(),
}) satisfies z.ZodType<GenshinSaveEnvelope>;
