import { z } from "zod";

// A file the manifest holds by its hash: the hash of its bytes, which names the object, and their size
export interface ParityStoredFile {
  bytes: number;
  sha256: string;
}

export const parityStoredFileSchema: z.ZodObject<{ bytes: z.ZodNumber; sha256: z.ZodString }> = z.object({
  bytes: z.int().positive(),
  sha256: z.string().regex(/^[\da-f]{64}$/u),
}) satisfies z.ZodType<ParityStoredFile>;
