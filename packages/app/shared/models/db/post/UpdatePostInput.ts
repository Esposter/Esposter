import { selectPostSchema } from "#shared/db/schema/posts";

export const updatePostInputSchema = selectPostSchema
  .pick("id")
  .merge(selectPostSchema.pick("title", "description").partial());
export type UpdatePostInput = typeof updatePostInputSchema.infer;
