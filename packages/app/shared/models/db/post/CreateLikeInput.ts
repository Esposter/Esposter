import type { z } from "zod";

import { selectLikeSchema } from "@esposter/db-schema";

export const createLikeInputSchema = selectLikeSchema.pick({ postId: true, value: true });
export type CreateLikeInput = z.infer<typeof createLikeInputSchema>;
