import type { z } from "zod";

import { selectPostSchema } from "#shared/db/schema/posts";

export const deletePostInputSchema = selectPostSchema.shape.id;
export type DeletePostInput = z.infer<typeof deletePostInputSchema>;
