import { selectCommentSchema } from "#shared/db/schema/posts";
import { z } from "zod/v4";

export const createCommentInputSchema = z.object({
  ...selectCommentSchema.pick({ description: true }).shape,
  [selectCommentSchema.keyof().enum.parentId]: selectCommentSchema.shape.parentId.unwrap(),
});
export type CreateCommentInput = z.infer<typeof createCommentInputSchema>;
