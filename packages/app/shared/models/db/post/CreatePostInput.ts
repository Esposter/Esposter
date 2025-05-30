import { selectPostSchema } from "#shared/db/schema/posts";
import { z } from "zod/v4";

export const createPostInputSchema = z.object({
  ...selectPostSchema.pick({ title: true }).shape,
  ...selectPostSchema.partial({ description: true }).shape,
});
export type CreatePostInput = z.infer<typeof createPostInputSchema>;
