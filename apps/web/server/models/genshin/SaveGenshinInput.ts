import type { GenshinSaveEnvelope } from "#server/models/genshin/GenshinSaveEnvelope";

import { genshinSaveEnvelopeSchema } from "#server/models/genshin/GenshinSaveEnvelope";
import { MAX_ETAG_LENGTH } from "#server/services/blobState/constants";
import { z } from "zod";

// A write of the save by the session that holds it, under the ETag that session's last start or save returned
export interface SaveGenshinInput extends GenshinSaveEnvelope {
  etag: string;
}

export const saveGenshinInputSchema = genshinSaveEnvelopeSchema.safeExtend({
  etag: z.string().max(MAX_ETAG_LENGTH),
}) satisfies z.ZodType<SaveGenshinInput>;
