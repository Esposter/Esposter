import type { PageSort } from "@esposter/db-schema";

import { createPageInputSchema, roomIdSchema, SortOrder } from "@esposter/db-schema";
import { z } from "zod";

// Newest first. An invite's id is a random secret rather than a time-ordered one.
// So creation time leads, and the id only breaks its ties
export const ROOM_INVITE_PAGE_SORT = { keys: ["createdAt", "id"], order: SortOrder.Desc } as const satisfies PageSort<
  "createdAt" | "id"
>;

export const readRoomInvitesInputSchema = z.object({
  ...roomIdSchema.shape,
  ...createPageInputSchema(ROOM_INVITE_PAGE_SORT).shape,
});
export type ReadRoomInvitesInput = z.infer<typeof readRoomInvitesInputSchema>;
