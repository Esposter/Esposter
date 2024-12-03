import type { z } from "zod";

import { selectLikeSchema } from "#shared/db/schema/users";

export const deleteLikeInputSchema = selectLikeSchema.shape.postId;
export type DeleteLikeInput = z.infer<typeof deleteLikeInputSchema>;
