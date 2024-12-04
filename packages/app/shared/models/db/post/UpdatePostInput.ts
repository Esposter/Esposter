import type { z } from "zod";

import { selectPostSchema } from "#shared/db/schema/posts";

export const updatePostInputSchema = selectPostSchema
  .pick({ id: true })
  .merge(selectPostSchema.partial().pick({ description: true, title: true }));
export type UpdatePostInput = z.infer<typeof updatePostInputSchema>;
