import { z } from "zod";

// A pack the browser keeps, by its character's id and the hash of its files, a SHA-256 in hexadecimal, which its files
// Are stored under
export interface StoredCharacterPack {
  characterId: number;
  packHash: string;
}

export const storedCharacterPackSchema = z.object({
  characterId: z.int().positive(),
  packHash: z.string().regex(/^[\da-f]{64}$/u),
}) satisfies z.ZodType<StoredCharacterPack>;
