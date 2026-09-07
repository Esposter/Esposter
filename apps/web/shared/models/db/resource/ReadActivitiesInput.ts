import { resourceIdInputSchema } from "#shared/models/db/resource/ResourceIdInput";
import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { MESSAGE_ROWKEY_SORT_ITEM } from "#shared/services/pagination/constants";
import { resourceActivityEntitySchema } from "@esposter/db-schema";
import { z } from "zod";

export const readActivitiesInputSchema = z.object({
  ...resourceIdInputSchema.shape,
  ...createCursorPaginationParamsSchema(resourceActivityEntitySchema.keyof(), [MESSAGE_ROWKEY_SORT_ITEM]).omit({
    sortBy: true,
  }).shape,
});
export type ReadActivitiesInput = z.infer<typeof readActivitiesInputSchema>;
