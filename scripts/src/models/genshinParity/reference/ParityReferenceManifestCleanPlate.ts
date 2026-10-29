import type { ParityReferenceManifestImage } from "#src/models/genshinParity/reference/ParityReferenceManifestImage";

import { z } from "zod";

// A reference's clean plate: the image as stored, and the digest of the screenshot and regions it was filled from, so a
// changed input or region is filled again rather than read as the old plate
export interface ParityReferenceManifestCleanPlate extends ParityReferenceManifestImage {
  digest: string;
}

export const parityReferenceManifestCleanPlateSchema: z.ZodType<ParityReferenceManifestCleanPlate> = z.object({
  bytes: z.int().positive(),
  digest: z.string().regex(/^[\da-f]{16}$/u),
  height: z.int().positive(),
  sha256: z.string().regex(/^[\da-f]{64}$/u),
  width: z.int().positive(),
});
