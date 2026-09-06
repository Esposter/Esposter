import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { selectRoomInMessageSchema } from "@esposter/db-schema";
import { ItemMetadataPropertyNames } from "@esposter/shared";
import { z } from "zod";

export const readDirectMessagesInputSchema = z
  .object({
    ...createCursorPaginationParamsSchema(selectRoomInMessageSchema.keyof(), [
      { key: ItemMetadataPropertyNames.updatedAt, order: SortOrder.Desc },
    ]).shape,
  })
  .prefault({});
export type ReadDirectMessagesInput = z.infer<typeof readDirectMessagesInputSchema>;
