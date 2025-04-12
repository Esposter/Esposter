import { selectPostSchema } from "#shared/db/schema/posts";

export const createPostInputSchema = selectPostSchema
  .pick("title")
  .merge(selectPostSchema.pick("description").partial());
export type CreatePostInput = typeof createPostInputSchema.infer;
