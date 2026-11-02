import { MAX_REQUEST_SIZE } from "#shared/services/app/constants";
import { ASSET_HASH_REGEX } from "#shared/services/resource/constants";
import { selectResourceInResourceSchema } from "@esposter/db-schema";
import { z } from "zod";

export const saveResourceContentDeltaInputSchema = z.object({
  // The hash of the stored bytes the delta was compressed against, as the last save handed it back
  baselineHash: selectResourceInResourceSchema.shape.contentHash.pipe(z.string().regex(ASSET_HASH_REGEX)),
  contentVersion: selectResourceInResourceSchema.shape.contentVersion,
  // A zstd frame with the baseline as its dictionary, base64 because a delta is kilobytes and the JSON body then
  // Needs no binary route of its own. One too large for a request body is sent as a staged save instead
  delta: z.base64().max(MAX_REQUEST_SIZE),
  id: selectResourceInResourceSchema.shape.id,
});
export type SaveResourceContentDeltaInput = z.infer<typeof saveResourceContentDeltaInputSchema>;
