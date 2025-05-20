import type { z } from "zod/v4";

import { selectLikeSchema } from "#shared/db/schema/users";

export const createLikeInputSchema = selectLikeSchema.pick({ postId: true, value: true });
export type CreateLikeInput = z.infer<typeof createLikeInputSchema>;
