import type { z } from "zod";

import { BAN_PAGE_SORT, createPageInputSchema, roomIdSchema, selectUserInAuthSchema } from "@esposter/db-schema";

export const readBansInputSchema = createPageInputSchema(BAN_PAGE_SORT).extend({
  ...roomIdSchema.shape,
  // The banned user's name, matching what `readMembers` takes. The reason is deliberately not searched: it is free
  // Text a moderator wrote, and the want the panel serves is whether a person is banned, which is a name
  filter: selectUserInAuthSchema.pick({ name: true }).optional(),
});
export type ReadBansInput = z.infer<typeof readBansInputSchema>;
