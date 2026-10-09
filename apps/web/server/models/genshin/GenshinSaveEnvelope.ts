import type { GenshinSave } from "genshin-world/save";

import { genshinSaveSchema } from "genshin-world/save";
import { z } from "zod";

// The Genshin blob: the save and the session that holds it, so the one blob's ETag covers both the save and the lease.
// The session a start replaced is kept until the save is first written, so a retry of that start answers it again
export interface GenshinSaveEnvelope {
  previousSessionId?: string;
  save: GenshinSave;
  sessionId: string;
}

export const genshinSaveEnvelopeSchema = z.object({
  previousSessionId: z.uuid().optional(),
  save: genshinSaveSchema,
  sessionId: z.uuid(),
}) satisfies z.ZodType<GenshinSaveEnvelope>;
