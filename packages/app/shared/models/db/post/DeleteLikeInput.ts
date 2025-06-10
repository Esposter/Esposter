import type { z } from "zod/v4";

import { selectLikeSchema } from "#shared/db/schema/likes";

export const deleteLikeInputSchema = selectLikeSchema.shape.postId;
export type DeleteLikeInput = z.infer<typeof deleteLikeInputSchema>;
