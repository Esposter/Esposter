import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { selectPostSchema, userIdSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readPostsInputSchema = z
  .object({
    ...createCursorPaginationParamsSchema(selectPostSchema.keyof(), [
      { key: selectPostSchema.keyof().enum.ranking, order: SortOrder.Desc },
      { key: selectPostSchema.keyof().enum.id, order: SortOrder.Desc },
    ]).shape,
    [selectPostSchema.keyof().enum.parentId]: selectPostSchema.shape.parentId.default(null),
    [selectPostSchema.keyof().enum.userId]: userIdSchema.shape.userId.optional(),
  })
  .prefault({});
export type ReadPostsInput = z.infer<typeof readPostsInputSchema>;
