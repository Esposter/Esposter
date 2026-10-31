import type { ParityStoredFile } from "#src/models/genshinParity/reference/ParityStoredFile";

import { parityStoredFileSchema } from "#src/models/genshinParity/reference/ParityStoredFile";
import { z } from "zod";

// A record: a file a person can only have on disk, named by its path from the parity folder it is restored to
export interface ParityRecordManifestRow extends ParityStoredFile {
  path: string;
  sourceFormat: string;
}

export const parityRecordManifestRowSchema: z.ZodType<ParityRecordManifestRow> = z.object({
  ...parityStoredFileSchema.shape,
  path: z.string().regex(/^[^\\/][^\\]*$/u),
  sourceFormat: z.string().regex(/^[\da-z]+$/u),
});
