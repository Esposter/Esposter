import { resourceIdInputSchema } from "#shared/models/db/resource/ResourceIdInput";
import { ASSET_HASH_REGEX } from "#shared/services/resource/constants";
import { z } from "zod";

export const deleteFileInputSchema = z.object({
  // The client recovers this from the stable asset url, and the release takes it as the address the file is stored under,
  // So only the lowercase hex hash of the file's bytes is accepted
  ...resourceIdInputSchema.shape,
  blobPath: z.string().regex(ASSET_HASH_REGEX),
});
export type DeleteFileInput = z.infer<typeof deleteFileInputSchema>;
