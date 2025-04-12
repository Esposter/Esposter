import { selectPostSchema } from "#shared/db/schema/posts";

export const updatePostInputSchema = selectPostSchema
  .pick("id")
  .merge(selectPostSchema.partial().pick("title", "description"));
export type UpdatePostInput = typeof updatePostInputSchema.infer;
