import { FILTER_KEY_MAX_LENGTH, FILTER_WORDS_MAX_LENGTH } from "@/shared/services/message/constants";
import { roomIdSchema } from "@esposter/db-schema";
import { z } from "zod";

export const upsertRoomFilterInputSchema = z.object({
  ...roomIdSchema.shape,
  words: z.string().min(1).max(FILTER_KEY_MAX_LENGTH).array().max(FILTER_WORDS_MAX_LENGTH),
});
export type UpsertRoomFilterInput = z.infer<typeof upsertRoomFilterInputSchema>;
