import { selectCommentSchema } from "#shared/db/schema/posts";

export const createCommentInputSchema = selectCommentSchema.pick("parentId", "description");
export type CreateCommentInput = typeof createCommentInputSchema.infer;
