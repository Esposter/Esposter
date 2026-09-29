import type { z } from "zod";

import { selectLikeInPostSchema } from "@esposter/db-schema";

export const deleteLikeInputSchema = selectLikeInPostSchema.shape.postId;
export type DeleteLikeInput = z.infer<typeof deleteLikeInputSchema>;
