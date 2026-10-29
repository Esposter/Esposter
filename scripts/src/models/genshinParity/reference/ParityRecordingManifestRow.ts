import type { ParityReferenceAttribution } from "#src/models/genshinParity/reference/ParityReferenceAttribution";

import { parityReferenceAttributionSchema } from "#src/models/genshinParity/reference/ParityReferenceAttribution";
import { z } from "zod";

// A recording file: a user's capture or a public clip, named by its file name. `source` is its public url, or
// `user recording` when no public one exists, and `range` the seconds a clip was cut from
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
