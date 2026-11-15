import { PostSortType } from "#shared/models/post/PostSortType";
import { PostSortTypePageSortMap } from "#shared/services/post/PostSortTypePageSortMap";
import { createSortedPageInputSchema, selectPostInPostSchema, userIdSchema } from "@esposter/db-schema";
import { z } from "zod";

// The feed and a thread both page by the sort the reader names. The filters and the page are one intersection, since a
// Sorted page's cursor is parsed for the sort it names and so cannot be extended as an object
export const readPostsInputSchema = z
  .object({
    [selectPostInPostSchema.keyof().enum.parentId]: selectPostInPostSchema.shape.parentId.default(null),
    [selectPostInPostSchema.keyof().enum.userId]: userIdSchema.shape.userId.optional(),
  })
  .and(createSortedPageInputSchema(z.enum(PostSortType), PostSortTypePageSortMap, PostSortType.Hot))
  .prefault({});
export type ReadPostsInput = z.infer<typeof readPostsInputSchema>;
