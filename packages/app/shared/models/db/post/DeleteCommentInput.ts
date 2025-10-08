import type { z } from "zod";

import { selectPostSchema } from "@esposter/db";

export const deleteCommentInputSchema = selectPostSchema.shape.id;
export type DeleteCommentInput = z.infer<typeof deleteCommentInputSchema>;
