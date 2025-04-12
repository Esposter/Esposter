import { selectLikeSchema } from "#shared/db/schema/users";

export const deleteLikeInputSchema = selectLikeSchema.get("postId");
export type DeleteLikeInput = typeof deleteLikeInputSchema.infer;
