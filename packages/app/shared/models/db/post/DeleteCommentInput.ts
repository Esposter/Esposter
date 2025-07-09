import type { z } from "zod";

import { selectPostSchema } from "#shared/db/schema/posts";

export const deleteCommentInputSchema = selectPostSchema.shape.id;
export type DeleteCommentInput = z.infer<typeof deleteCommentInputSchema>;
