import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { roomIdSchema, roomMessageSchema } from "@esposter/db-schema";
import { MAX_READ_LIMIT } from "@esposter/shared";
import { z } from "zod";

// A room's messages newest first from the one before `before`, the id of the last message the client holds, or
// Oldest first from the one after `after`. The pinned filter narrows the same listing, so the pinned list pages the same way
export const readMessagesInputSchema = z.object({
  after: roomMessageSchema.shape.id.optional(),
  before: roomMessageSchema.shape.id.optional(),
  filter: roomMessageSchema.pick({ isPinned: true }).optional(),
  limit: z.int().min(1).max(MAX_READ_LIMIT).default(DEFAULT_READ_LIMIT),
  ...roomIdSchema.shape,
});
export type ReadMessagesInput = z.infer<typeof readMessagesInputSchema>;
