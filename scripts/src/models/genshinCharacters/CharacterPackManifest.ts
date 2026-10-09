import { z } from "zod";

// What a pack's record lists: the sha256 of each of its files by its path in the pack, sorted by path, so the record's
// Own hash, which the pack's files are stored under, moves with any file and with nothing else
export interface CharacterPackManifest {
  files: Record<string, string>;
}

export const characterPackManifestSchema: z.ZodObject<{
  files: z.ZodRecord<z.ZodString, z.ZodCustomStringFormat<"sha256_hex">>;
}> = z.object({ files: z.record(z.string().min(1), z.hash("sha256")) }) satisfies z.ZodType<CharacterPackManifest>;
