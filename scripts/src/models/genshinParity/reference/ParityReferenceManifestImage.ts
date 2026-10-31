import type { ParityStoredFile } from "#src/models/genshinParity/reference/ParityStoredFile";

import { parityStoredFileSchema } from "#src/models/genshinParity/reference/ParityStoredFile";
import { z } from "zod";

// One stored image: the file it packs to, and the pixel size it is drawn at
export interface ParityReferenceManifestImage extends ParityStoredFile {
  height: number;
  width: number;
}

export const parityReferenceManifestImageSchema: z.ZodObject<{
  bytes: z.ZodNumber;
  height: z.ZodNumber;
  sha256: z.ZodString;
  width: z.ZodNumber;
}> = z.object({
  ...parityStoredFileSchema.shape,
  height: z.int().positive(),
  width: z.int().positive(),
}) satisfies z.ZodType<ParityReferenceManifestImage>;
