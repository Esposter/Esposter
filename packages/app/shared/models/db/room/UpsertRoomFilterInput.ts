import {
  FILTER_KEY_MAX_LENGTH,
  FILTER_WORDS_MAX_LENGTH,
  roomIdSchema,
  WordFilterAction,
  wordFilterActionSchema,
} from "@esposter/db-schema";
import { createUniqueArraySchema, normalizeString } from "@esposter/shared";
import { z } from "zod";

export const upsertRoomFilterInputSchema = z
  .object({
    ...roomIdSchema.shape,
    action: wordFilterActionSchema.default(WordFilterAction.Reject),
    timeoutDurationMs: z.int().positive().nullable().default(null),
    words: createUniqueArraySchema(
      z
        .string()
        .transform((v) => normalizeString(v).toLowerCase())
        .pipe(z.string().min(1).max(FILTER_KEY_MAX_LENGTH)),
    ).max(FILTER_WORDS_MAX_LENGTH),
  })
  // A Timeout action is meaningless without a duration — mirror the database CHECK at the input boundary.
  .refine(({ action, timeoutDurationMs }) => action !== WordFilterAction.Timeout || timeoutDurationMs !== null, {
    error: "A timeout duration is required when the action is Timeout.",
    path: ["timeoutDurationMs"],
  });
export type UpsertRoomFilterInput = z.infer<typeof upsertRoomFilterInputSchema>;
