import type { ParityReferenceManifestImage } from "#src/models/genshinParity/reference/ParityReferenceManifestImage";

import { parityReferenceManifestImageSchema } from "#src/models/genshinParity/reference/ParityReferenceManifestImage";
import { z } from "zod";

// A reference's clean plate: the image as stored, and the digest of the screenshot and regions it was filled from, so a
// changed input or region is filled again rather than read as the old plate
export interface ParityReferenceManifestCleanPlate extends ParityReferenceManifestImage {
  digest: string;
}

export const parityReferenceManifestCleanPlateSchema: z.ZodObject<{
  bytes: z.ZodNumber;
  digest: z.ZodString;
  height: z.ZodNumber;
  sha256: z.ZodString;
  width: z.ZodNumber;
}> = parityReferenceManifestImageSchema.extend({
  digest: z.string().regex(/^[\da-f]{16}$/u),
}) satisfies z.ZodType<ParityReferenceManifestCleanPlate>;
