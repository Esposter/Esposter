import { selectLikeSchema } from "#shared/db/schema/users";

export const createLikeInputSchema = selectLikeSchema.pick("postId", "value");
export type CreateLikeInput = typeof createLikeInputSchema.infer;
