import { MAX_REQUEST_SIZE } from "#shared/services/app/constants";
import { selectResourceSchema } from "@esposter/db-schema";
import { z } from "zod";

export const saveResourceContentDeltaInputSchema = z.object({
  // The hash of the stored bytes the delta was compressed against, as the last save handed it back
  baselineHash: selectResourceSchema.shape.contentHash.pipe(z.hash("sha256")),
  contentVersion: selectResourceSchema.shape.contentVersion,
  // A zstd frame with the baseline as its dictionary, base64 because a delta is kilobytes and the JSON body then
  // Needs no binary route of its own. One too large for a request body is sent as a staged save instead
  delta: z.base64().max(MAX_REQUEST_SIZE),
  id: selectResourceSchema.shape.id,
});
export type SaveResourceContentDeltaInput = z.infer<typeof saveResourceContentDeltaInputSchema>;
