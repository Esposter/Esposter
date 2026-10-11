import {
  MAX_CHARACTER_PACK_FILE_COUNT,
  MAX_CHARACTER_PACK_FILE_SIZE,
  SHA256_REGEX,
} from "#server/services/genshin/accountCharacterPack/constants";
import { z } from "zod";

// A file of a pack an account keeps: the path the layout serves it at, the hash its bytes are stored under and their size
export interface AccountCharacterPackFileRecord {
  path: string;
  sha256: string;
  size: number;
}

// A pack an account keeps, by its character, the hash of its files and its model's name, which the account's list holds
export interface AccountCharacterPackRecord {
  characterId: number;
  files: AccountCharacterPackFileRecord[];
  modelName: string;
  packHash: string;
}

export const accountCharacterPackFileRecordSchema = z.object({
  path: z.string().min(1),
  sha256: z.string().regex(SHA256_REGEX),
  size: z.int().positive().max(MAX_CHARACTER_PACK_FILE_SIZE),
}) satisfies z.ZodType<AccountCharacterPackFileRecord>;

export const accountCharacterPackRecordSchema = z.object({
  characterId: z.int().positive(),
  files: z.array(accountCharacterPackFileRecordSchema).min(1).max(MAX_CHARACTER_PACK_FILE_COUNT),
  modelName: z.string(),
  packHash: z.string().regex(SHA256_REGEX),
}) satisfies z.ZodType<AccountCharacterPackRecord>;
