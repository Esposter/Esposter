import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { selectPostInPostSchema, userIdSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readPostsInputSchema = z
  .object({
    ...createCursorPaginationParamsSchema(selectPostInPostSchema.keyof(), [
      { key: selectPostInPostSchema.keyof().enum.ranking, order: SortOrder.Desc },
      { key: selectPostInPostSchema.keyof().enum.id, order: SortOrder.Desc },
    ]).shape,
    [selectPostInPostSchema.keyof().enum.parentId]: selectPostInPostSchema.shape.parentId.default(null),
    [selectPostInPostSchema.keyof().enum.userId]: userIdSchema.shape.userId.optional(),
  })
  .prefault({});
export type ReadPostsInput = z.infer<typeof readPostsInputSchema>;
