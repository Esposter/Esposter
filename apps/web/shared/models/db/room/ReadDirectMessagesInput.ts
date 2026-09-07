import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { UPDATED_AT_DESCENDING_SORT_ITEM } from "#shared/services/pagination/constants";
import { selectRoomInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readDirectMessagesInputSchema = createCursorPaginationParamsSchema(selectRoomInMessageSchema.keyof(), [
  UPDATED_AT_DESCENDING_SORT_ITEM,
]).prefault({});
export type ReadDirectMessagesInput = z.infer<typeof readDirectMessagesInputSchema>;
