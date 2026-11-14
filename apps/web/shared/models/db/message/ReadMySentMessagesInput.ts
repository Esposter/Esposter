import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { roomIdSchema, roomMessageSchema } from "@esposter/db-schema";
import { MAX_READ_LIMIT } from "@esposter/shared";
import { z } from "zod";

// The sent messages of the caller, newest first, from the one after `before`: the last message of the previous page,
// Named by the triple the sender's index holds it under
export const readMySentMessagesInputSchema = z
  .object({
    before: z
      .object({ createdAt: z.coerce.date(), messageId: roomMessageSchema.shape.id, roomId: roomIdSchema.shape.roomId })
      .optional(),
    limit: z.int().min(1).max(MAX_READ_LIMIT).default(DEFAULT_READ_LIMIT),
  })
  .prefault({});
export type ReadMySentMessagesInput = z.infer<typeof readMySentMessagesInputSchema>;
