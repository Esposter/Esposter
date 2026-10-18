import {
  MAX_CHARACTER_PACK_FILE_COUNT,
  MAX_CHARACTER_PACK_FILE_SIZE,
} from "#server/services/genshin/accountCharacterPack/constants";
import { z } from "zod";

// The files of a pack about to be kept, each by the size its upload is granted for
export interface GenerateCharacterPackUploadSasUrlsInput {
  files: { size: number }[];
}

export const generateCharacterPackUploadSasUrlsInputSchema = z.object({
  files: z
    .array(z.object({ size: z.int().positive().max(MAX_CHARACTER_PACK_FILE_SIZE) }))
    .min(1)
    .max(MAX_CHARACTER_PACK_FILE_COUNT),
}) satisfies z.ZodType<GenerateCharacterPackUploadSasUrlsInput>;
