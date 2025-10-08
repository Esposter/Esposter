import type { z } from "zod";

import { selectLikeSchema } from "@esposter/db";

export const deleteLikeInputSchema = selectLikeSchema.shape.postId;
export type DeleteLikeInput = z.infer<typeof deleteLikeInputSchema>;
