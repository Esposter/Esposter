import type { ParityReferenceAttribution } from "#src/models/genshinParity/reference/ParityReferenceAttribution";
import type { ParityReferenceManifestCleanPlate } from "#src/models/genshinParity/reference/ParityReferenceManifestCleanPlate";
import type { ParityReferenceManifestImage } from "#src/models/genshinParity/reference/ParityReferenceManifestImage";

import { parityReferenceAttributionSchema } from "#src/models/genshinParity/reference/ParityReferenceAttribution";
import { ParityReferenceKind } from "#src/models/genshinParity/reference/ParityReferenceKind";
import { parityReferenceManifestCleanPlateSchema } from "#src/models/genshinParity/reference/ParityReferenceManifestCleanPlate";
import { parityReferenceManifestImageSchema } from "#src/models/genshinParity/reference/ParityReferenceManifestImage";
import { z } from "zod";

// One reference, by its id: its main image as stored, its plate screenshot and clean plate when its entry has them, and
// what it was drawn from and when. Every stored image is named by the hash of its bytes, so identical bytes are one object
export interface ParityReferenceManifestRow extends ParityReferenceManifestImage {
  attribution: ParityReferenceAttribution;
  capturedAt: string;
  cleanPlate?: ParityReferenceManifestCleanPlate;
  clientBuild?: string;
  id: string;
  kind: ParityReferenceKind;
  language?: string;
  plate?: ParityReferenceManifestImage;
  source?: string;
  // The format the screenshot was sniffed as from its bytes, never from its file name
  sourceFormat: string;
}

export const parityReferenceManifestRowSchema: z.ZodType<ParityReferenceManifestRow> =
  parityReferenceManifestImageSchema.extend({
    attribution: parityReferenceAttributionSchema,
    capturedAt: z.iso.datetime(),
    cleanPlate: parityReferenceManifestCleanPlateSchema.optional(),
    clientBuild: z.string().min(1).optional(),
    id: z.string().min(1),
    kind: z.enum(ParityReferenceKind),
    language: z
      .string()
      .regex(/^[a-z]{2,3}$/u)
      .optional(),
    plate: parityReferenceManifestImageSchema.optional(),
    sha256: z.string().regex(/^[\da-f]{64}$/u),
    source: z.string().min(1).optional(),
    sourceFormat: z.string().regex(/^[a-z]+$/u),
  });
