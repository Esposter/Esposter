import { z } from "zod";

// A record: a file a person can only have on disk, named by its path from the parity folder it is restored to
export interface ParityRecordManifestRow {
  bytes: number;
  path: string;
  sha256: string;
  sourceFormat: string;
}

export const parityRecordManifestRowSchema: z.ZodType<ParityRecordManifestRow> = z.object({
  bytes: z.int().positive(),
  path: z.string().regex(/^[^\\/][^\\]*$/u),
  sha256: z.string().regex(/^[\da-f]{64}$/u),
  sourceFormat: z.string().regex(/^[\da-z]+$/u),
});
