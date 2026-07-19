import { roomFilterWordSchema } from "#shared/models/db/room/RoomFilterWord";
import {
  FILTER_WORDS_MAX_LENGTH,
  MAX_TIMEOUT_DURATION_MS,
  roomIdSchema,
  WordFilterAction,
  wordFilterActionSchema,
} from "@esposter/db-schema";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

export const upsertRoomFilterInputSchema = z
  .object({
    ...roomIdSchema.shape,
    action: wordFilterActionSchema.default(WordFilterAction.Reject),
    timeoutDurationMs: z.int().positive().max(MAX_TIMEOUT_DURATION_MS).nullable().default(null),
    words: createUniqueArraySchema(roomFilterWordSchema).max(FILTER_WORDS_MAX_LENGTH),
  })
  // A Timeout action is meaningless without a duration — mirror the database CHECK at the input boundary.
  .refine(({ action, timeoutDurationMs }) => action !== WordFilterAction.Timeout || timeoutDurationMs !== null, {
    error: "A timeout duration is required when the action is Timeout.",
    path: ["timeoutDurationMs"],
  });
export type UpsertRoomFilterInput = z.infer<typeof upsertRoomFilterInputSchema>;
