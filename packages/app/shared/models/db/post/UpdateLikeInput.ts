import { selectLikeSchema } from "#shared/db/schema/users";

export const updateLikeInputSchema = selectLikeSchema.pick("postId", "value");
export type UpdateLikeInput = typeof updateLikeInputSchema.infer;
