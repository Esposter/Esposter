import { selectPostSchema } from "#shared/db/schema/posts";
import { z } from "zod/v4";

export const updatePostInputSchema = z.object({
  ...selectPostSchema.pick({ id: true }).shape,
  ...selectPostSchema
    .pick({ description: true, title: true })
    .partial()
    .refine(({ description, title }) => Boolean(description) || Boolean(title)).shape,
});
export type UpdatePostInput = z.infer<typeof updatePostInputSchema>;
