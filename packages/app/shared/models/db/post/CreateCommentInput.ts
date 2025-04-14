import { selectPostSchema } from "#shared/db/schema/posts";
import { z } from "zod";

export const createCommentInputSchema = selectPostSchema
  .pick({ description: true })
  .extend({ description: z.string().min(1) })
  .extend(z.interface({ [selectPostSchema.keyof().enum.parentId]: selectPostSchema.shape.parentId.unwrap() }));
export type CreateCommentInput = z.infer<typeof createCommentInputSchema>;
