import type { z } from "zod";

import { selectPostSchema } from "#shared/db/schema/posts";

export const updatePostInputSchema = selectPostSchema
  .pick({ id: true })
  .merge(selectPostSchema.pick({ description: true, title: true }).partial());
export type UpdatePostInput = z.infer<typeof updatePostInputSchema>;
