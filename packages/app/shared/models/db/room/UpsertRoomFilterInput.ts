import { FILTER_KEY_MAX_LENGTH, FILTER_WORDS_MAX_LENGTH, roomIdSchema } from "@esposter/db-schema";
import { normalizeString } from "@esposter/shared";
import { z } from "zod";

export const upsertRoomFilterInputSchema = z.object({
  ...roomIdSchema.shape,
  words: z
    .string()
    .transform((v) => normalizeString(v).toLowerCase())
    .pipe(z.string().min(1).max(FILTER_KEY_MAX_LENGTH))
    .array()
    .max(FILTER_WORDS_MAX_LENGTH)
    .refine((words) => new Set(words).size === words.length, "Words must be unique"),
});
export type UpsertRoomFilterInput = z.infer<typeof upsertRoomFilterInputSchema>;
