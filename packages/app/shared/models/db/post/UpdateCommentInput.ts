import type { z } from "zod";

import { selectCommentSchema } from "#shared/db/schema/posts";

export const updateCommentInputSchema = selectCommentSchema.pick({ description: true, id: true });
export type UpdateCommentInput = z.infer<typeof updateCommentInputSchema>;
