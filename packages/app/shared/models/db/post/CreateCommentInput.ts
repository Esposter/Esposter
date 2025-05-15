import { selectCommentSchema } from "#shared/db/schema/posts";
import { z } from "zod";

export const createCommentInputSchema = selectCommentSchema
  .pick({ description: true })
  .extend({ description: z.string().min(1) })
  .extend(z.object({ [selectCommentSchema.keyof().enum.parentId]: selectCommentSchema.shape.parentId.unwrap() }));
export type CreateCommentInput = z.infer<typeof createCommentInputSchema>;
