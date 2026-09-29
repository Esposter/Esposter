import { selectCommentInPostSchema } from "@esposter/db-schema";
import { z } from "zod";

export const createCommentInputSchema = z.object({
  ...selectCommentInPostSchema.pick({ description: true }).shape,
  [selectCommentInPostSchema.keyof().enum.parentId]: selectCommentInPostSchema.shape.parentId.unwrap(),
});
export type CreateCommentInput = z.infer<typeof createCommentInputSchema>;
