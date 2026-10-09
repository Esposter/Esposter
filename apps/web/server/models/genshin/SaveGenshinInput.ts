import type { GenshinSave } from "genshin-world/save";

import { MAX_ETAG_LENGTH } from "#server/services/blobState/constants";
import { genshinSaveSchema } from "genshin-world/save";
import { z } from "zod";

// A write of the save by the session that holds it, under the ETag that session's last start or save returned
export interface SaveGenshinInput {
  etag: string;
  save: GenshinSave;
  sessionId: string;
}

export const saveGenshinInputSchema = z.object({
  etag: z.string().max(MAX_ETAG_LENGTH),
  save: genshinSaveSchema,
  sessionId: z.uuid(),
}) satisfies z.ZodType<SaveGenshinInput>;
