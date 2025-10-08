import type { z } from "zod";

import { selectLikeSchema } from "@esposter/db";

export const updateLikeInputSchema = selectLikeSchema.pick({ postId: true, value: true });
export type UpdateLikeInput = z.infer<typeof updateLikeInputSchema>;
