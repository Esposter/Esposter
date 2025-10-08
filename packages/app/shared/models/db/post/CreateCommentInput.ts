import { selectCommentSchema } from "@esposter/db";
import { z } from "zod";

export const createCommentInputSchema = z.object({
  ...selectCommentSchema.pick({ description: true }).shape,
  [selectCommentSchema.keyof().enum.parentId]: selectCommentSchema.shape.parentId.unwrap(),
});
export type CreateCommentInput = z.infer<typeof createCommentInputSchema>;
