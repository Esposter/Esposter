import type { z } from "zod";

import { selectCommentInPostSchema } from "@esposter/db-schema";

export const updateCommentInputSchema = selectCommentInPostSchema.pick({ description: true, id: true });
export type UpdateCommentInput = z.infer<typeof updateCommentInputSchema>;
