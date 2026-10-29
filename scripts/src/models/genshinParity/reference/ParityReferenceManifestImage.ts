import { z } from "zod";

// One stored image: the hash of its packed bytes, which names the object, and the size it packs to
export interface ParityReferenceManifestImage {
  bytes: number;
  height: number;
  sha256: string;
  width: number;
}

export const parityReferenceManifestImageSchema: z.ZodType<ParityReferenceManifestImage> = z.object({
  bytes: z.int().positive(),
  height: z.int().positive(),
  sha256: z.string().regex(/^[\da-f]{64}$/u),
  width: z.int().positive(),
});
