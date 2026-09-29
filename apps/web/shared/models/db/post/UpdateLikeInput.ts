import type { z } from "zod";

import { selectLikeInPostSchema } from "@esposter/db-schema";

export const updateLikeInputSchema = selectLikeInPostSchema.pick({ postId: true, value: true });
export type UpdateLikeInput = z.infer<typeof updateLikeInputSchema>;
