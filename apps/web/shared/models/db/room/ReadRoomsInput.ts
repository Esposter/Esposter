import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { UPDATED_AT_DESCENDING_SORT_ITEM } from "#shared/services/pagination/constants";
import { refineRoomSchema, selectRoomInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readRoomsInputSchema = z
  .object({
    includeDirectMessages: z.boolean().default(false),
    roomId: selectRoomInMessageSchema.shape.id.optional(),
    ...createCursorPaginationParamsSchema(selectRoomInMessageSchema.keyof().or(z.literal("displayName")), [
      UPDATED_AT_DESCENDING_SORT_ITEM,
    ]).shape,
    filter: refineRoomSchema(selectRoomInMessageSchema.pick({ name: true })).optional(),
  })
  .prefault({});
export type ReadRoomsInput = z.infer<typeof readRoomsInputSchema>;
