import { selectCommentSchema } from "#shared/db/schema/posts";
import { z } from "zod";

export const createCommentInputSchema = selectCommentSchema
  .pick({ description: true })
  .merge(z.object({ [selectCommentSchema.keyof().Values.parentId]: selectCommentSchema.shape.parentId.unwrap() }));
export type CreateCommentInput = z.infer<typeof createCommentInputSchema>;
