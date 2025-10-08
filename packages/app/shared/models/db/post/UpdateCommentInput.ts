import type { z } from "zod";

import { selectCommentSchema } from "@esposter/db";

export const updateCommentInputSchema = selectCommentSchema.pick({ description: true, id: true });
export type UpdateCommentInput = z.infer<typeof updateCommentInputSchema>;
