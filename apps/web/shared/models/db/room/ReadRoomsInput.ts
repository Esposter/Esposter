import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { UPDATED_AT_DESCENDING_SORT_ITEM } from "#shared/services/pagination/constants";
import { refineRoomSchema, selectRoomInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readRoomsInputSchema = z
  .object({
    includeDirectMessages: z.boolean().default(false),
    roomId: selectRoomInMessageSchema.shape.id.optional(),
    // An update time is not unique either, so the id breaks its ties and a cursor never skips one of two equal rooms
    ...createCursorPaginationParamsSchema(selectRoomInMessageSchema.keyof().or(z.literal("displayName")), [
      UPDATED_AT_DESCENDING_SORT_ITEM,
      { key: "id", order: SortOrder.Desc },
    ]).shape,
    filter: refineRoomSchema(selectRoomInMessageSchema.pick({ name: true })).optional(),
  })
  .prefault({});
export type ReadRoomsInput = z.infer<typeof readRoomsInputSchema>;
