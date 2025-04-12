import { selectPostSchema } from "#shared/db/schema/posts";
import { z } from "zod";

export const updateCommentInputSchema = selectPostSchema
  .pick("id", "description")
  .extend({ description: z.string().min(1) });
export type UpdateCommentInput = typeof updateCommentInputSchema.infer;
