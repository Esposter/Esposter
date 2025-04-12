import { selectPostSchema } from "#shared/db/schema/posts";
import { z } from "zod";

export const createCommentInputSchema = selectPostSchema
  .pick("parentId", "description")
  .extend({ description: z.string().min(1) });
export type CreateCommentInput = typeof createCommentInputSchema.infer;
