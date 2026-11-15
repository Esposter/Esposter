import type { z } from "zod";

import {
  createPageInputSchema,
  MODERATION_NOTE_PAGE_SORT,
  roomIdSchema,
  selectUserInAuthSchema,
} from "@esposter/db-schema";

export const readModerationNotesInputSchema = createPageInputSchema(MODERATION_NOTE_PAGE_SORT).extend({
  ...roomIdSchema.shape,
  targetUserId: selectUserInAuthSchema.shape.id,
});
export type ReadModerationNotesInput = z.infer<typeof readModerationNotesInputSchema>;
