import { selectCommentSchema } from "#shared/db/schema/posts";

export const updateCommentInputSchema = selectCommentSchema.pick("id", "description");
export type UpdateCommentInput = typeof updateCommentInputSchema.infer;
