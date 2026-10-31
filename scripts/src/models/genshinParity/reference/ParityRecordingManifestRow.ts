import type { ParityReferenceAttribution } from "#src/models/genshinParity/reference/ParityReferenceAttribution";
import type { ParityStoredFile } from "#src/models/genshinParity/reference/ParityStoredFile";

import { parityReferenceAttributionSchema } from "#src/models/genshinParity/reference/ParityReferenceAttribution";
import { parityStoredFileSchema } from "#src/models/genshinParity/reference/ParityStoredFile";
import { z } from "zod";

// A public recording in the captures folder, named by its file name.
// `source` is its public url, and `range` the seconds a clip was cut from.
// Its bytes are never hosted: a restore fetches it again from `source` by the clip command it prints.
export interface ParityRecordingManifestRow extends ParityStoredFile {
  attribution: ParityReferenceAttribution;
  name: string;
  range?: { end: number; start: number };
  source: string;
  sourceFormat: string;
}

export const parityRecordingManifestRowSchema: z.ZodType<ParityRecordingManifestRow> = z.object({
  ...parityStoredFileSchema.shape,
  attribution: parityReferenceAttributionSchema,
  name: z.string().min(1),
  range: z.object({ end: z.number().nonnegative(), start: z.number().nonnegative() }).optional(),
  source: z.string().min(1),
  sourceFormat: z.string().regex(/^[\da-z]+$/u),
});
