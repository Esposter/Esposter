import { resourceIdInputSchema } from "#shared/models/db/resource/ResourceIdInput";
import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { CREATED_AT_DESCENDING_SORT_ITEM, ID_DESCENDING_SORT_ITEM } from "#shared/services/pagination/constants";
import { selectResourceActivityInResourceSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readActivitiesInputSchema = z.object({
  ...resourceIdInputSchema.shape,
  ...createCursorPaginationParamsSchema(selectResourceActivityInResourceSchema.keyof(), [
    CREATED_AT_DESCENDING_SORT_ITEM,
    ID_DESCENDING_SORT_ITEM,
  ]).omit({ sortBy: true }).shape,
});
export type ReadActivitiesInput = z.infer<typeof readActivitiesInputSchema>;
