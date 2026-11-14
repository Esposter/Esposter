import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { MAX_READ_LIMIT } from "@esposter/shared";
import { z } from "zod";

// The Scheduled tab's first page is read with no input at all, so an absent input parses as the defaults
export const readMyScheduledMessagesInputSchema = z
  .object({
    limit: z.int().min(1).max(MAX_READ_LIMIT).default(DEFAULT_READ_LIMIT),
    offset: z.int().nonnegative().default(0),
  })
  .prefault({});
export type ReadMyScheduledMessagesInput = z.infer<typeof readMyScheduledMessagesInputSchema>;
