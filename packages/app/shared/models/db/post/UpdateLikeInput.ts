import type { z } from "zod";

import { selectLikeSchema } from "#shared/db/schema/likes";

export const updateLikeInputSchema = selectLikeSchema.pick({ postId: true, value: true });
export type UpdateLikeInput = z.infer<typeof updateLikeInputSchema>;
