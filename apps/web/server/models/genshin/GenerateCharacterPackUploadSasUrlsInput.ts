import {
  MAX_CHARACTER_PACK_FILE_COUNT,
  MAX_CHARACTER_PACK_FILE_SIZE,
  SHA256_REGEX,
} from "#server/services/genshin/accountCharacterPack/constants";
import { z } from "zod";

// The files of a pack about to be kept, each by the hash it is stored under and its size, which an upload is granted for,
// And the keep's id those uploads are staged under
export interface GenerateCharacterPackUploadSasUrlsInput {
  files: { sha256: string; size: number }[];
  keepId: string;
}

export const generateCharacterPackUploadSasUrlsInputSchema = z.object({
  keepId: z.uuid(),
  files: z
    .array(
      z.object({ sha256: z.string().regex(SHA256_REGEX), size: z.int().positive().max(MAX_CHARACTER_PACK_FILE_SIZE) }),
    )
    .min(1)
    .max(MAX_CHARACTER_PACK_FILE_COUNT),
}) satisfies z.ZodType<GenerateCharacterPackUploadSasUrlsInput>;
