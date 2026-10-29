import type { ParityReferenceAttribution } from "#src/models/genshinParity/reference/ParityReferenceAttribution";

import { parityReferenceAttributionSchema } from "#src/models/genshinParity/reference/ParityReferenceAttribution";
import { z } from "zod";

// A public recording in the captures folder, named by its file name. `source` is its public url, and `range` the seconds
// a clip was cut from. Its bytes are never hosted: a restore fetches it again from `source` by the clip command it prints
export interface ParityRecordingManifestRow {
  attribution: ParityReferenceAttribution;
  bytes: number;
  name: string;
  range?: { end: number; start: number };
  sha256: string;
  source: string;
  sourceFormat: string;
}

export const parityRecordingManifestRowSchema: z.ZodType<ParityRecordingManifestRow> = z.object({
  attribution: parityReferenceAttributionSchema,
  bytes: z.int().positive(),
  name: z.string().min(1),
  range: z.object({ end: z.number().nonnegative(), start: z.number().nonnegative() }).optional(),
  sha256: z.string().regex(/^[\da-f]{64}$/u),
  source: z.string().min(1),
  sourceFormat: z.string().regex(/^[\da-z]+$/u),
});
