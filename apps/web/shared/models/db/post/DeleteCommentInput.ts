import type { z } from "zod";

import { selectCommentInPostSchema } from "@esposter/db-schema";

export const deleteCommentInputSchema = selectCommentInPostSchema.shape.id;
export type DeleteCommentInput = z.infer<typeof deleteCommentInputSchema>;
