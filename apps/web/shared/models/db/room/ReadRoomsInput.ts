import type { PageSort } from "@esposter/db-schema";

import {
  createSortedPageInputSchema,
  refineRoomSchema,
  selectRoomInMessageSchema,
  SortOrder,
} from "@esposter/db-schema";
import { z } from "zod";

// The sidebar lists rooms by when their last message was sent, and a search lists them by the name each shows. A message
// Time is not unique, and neither is a name, so the id breaks the ties of both
const readRoomsPageSorts = {
  displayName: { keys: ["displayName", "id"], order: SortOrder.Asc },
  lastMessageAt: { keys: ["lastMessageAt", "id"], order: SortOrder.Desc },
} as const satisfies Record<string, PageSort>;

const roomSortNameSchema = z.enum(["displayName", "lastMessageAt"]);

// The filters are merged beside the sorted page: the sorted page parses its cursor as the whole input, so it cannot be
// Extended field by field the way a fixed-sort read extends its page
export const readRoomsInputSchema = z
  .object({
    filter: refineRoomSchema(selectRoomInMessageSchema.pick({ name: true })).optional(),
    includeDirectMessages: z.boolean().default(false),
    roomId: selectRoomInMessageSchema.shape.id.optional(),
  })
  .and(createSortedPageInputSchema(roomSortNameSchema, readRoomsPageSorts, "lastMessageAt"))
  .prefault({});
export type ReadRoomsInput = z.infer<typeof readRoomsInputSchema>;
