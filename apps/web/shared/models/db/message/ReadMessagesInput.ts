import type { z } from "zod";

import { createPageInputSchema, ROOM_MESSAGE_PAGE_SORT, roomIdSchema, roomMessageSchema } from "@esposter/db-schema";

// A room's messages newest first from the cursor, which continues older or, backward, newer. The pinned filter narrows the
// Same listing, so the pinned list pages the same way
export const readMessagesInputSchema = createPageInputSchema(ROOM_MESSAGE_PAGE_SORT).extend({
  filter: roomMessageSchema.pick({ isPinned: true }).optional(),
  ...roomIdSchema.shape,
});
export type ReadMessagesInput = z.infer<typeof readMessagesInputSchema>;
