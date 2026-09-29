import type { z } from "zod";

import { selectLikeInPostSchema } from "@esposter/db-schema";

export const createLikeInputSchema = selectLikeInPostSchema.pick({ postId: true, value: true });
export type CreateLikeInput = z.infer<typeof createLikeInputSchema>;
