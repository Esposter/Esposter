import type { z } from "zod";

import { selectCommentSchema } from "@esposter/db-schema";

export const deleteCommentInputSchema = selectCommentSchema.shape.id;
export type DeleteCommentInput = z.infer<typeof deleteCommentInputSchema>;
