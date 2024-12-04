import { selectPostSchema } from "#shared/db/schema/posts";
import { z } from "zod";

export const updateCommentInputSchema = selectPostSchema
  .pick({ description: true, id: true })
  .extend({ description: z.string().min(1) });
export type UpdateCommentInput = z.infer<typeof updateCommentInputSchema>;
