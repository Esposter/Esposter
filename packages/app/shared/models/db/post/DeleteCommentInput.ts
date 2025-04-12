import { selectPostSchema } from "#shared/db/schema/posts";

export const deleteCommentInputSchema = selectPostSchema.get("id");
export type DeleteCommentInput = typeof deleteCommentInputSchema.infer;
