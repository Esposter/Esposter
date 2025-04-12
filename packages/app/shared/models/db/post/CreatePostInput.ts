import { selectPostSchema } from "#shared/db/schema/posts";

export const createPostInputSchema = selectPostSchema
  .pick("title")
  .merge(selectPostSchema.partial().pick("description"));
export type CreatePostInput = typeof createPostInputSchema.infer;
