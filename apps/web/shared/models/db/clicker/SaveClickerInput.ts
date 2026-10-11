import { clickerSaveSchema } from "#shared/models/clicker/data/ClickerSave";
import { MAX_ETAG_LENGTH } from "#shared/services/blobState/constants";
import { z } from "zod";

export const saveClickerInputSchema = z.object({
  data: clickerSaveSchema,
  etag: z.string().max(MAX_ETAG_LENGTH).optional(),
});
