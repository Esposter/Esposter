import { selectPostSchema } from "#shared/db/schema/posts";
import { z } from "zod/v4";

export const updatePostInputSchema = z.object({
  // @TODO: oneOf([description, title])
  ...selectPostSchema.pick({ id: true }).shape,
  ...selectPostSchema.partial({ description: true, title: true }).shape,
});
export type UpdatePostInput = z.infer<typeof updatePostInputSchema>;
