import { dungeonsSchema } from "#shared/models/dungeons/data/Dungeons";
import { MAX_ETAG_LENGTH } from "#shared/services/blobState/constants";
import { z } from "zod";

export const saveDungeonsInputSchema = z.object({
  data: dungeonsSchema,
  etag: z.string().max(MAX_ETAG_LENGTH).optional(),
});
