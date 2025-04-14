import type { z } from "zod";

import { selectPostSchema } from "#shared/db/schema/posts";

export const updatePostInputSchema = selectPostSchema
  .pick({ description: true, id: true, title: true })
  .partial({ description: true, title: true });
export type UpdatePostInput = z.infer<typeof updatePostInputSchema>;
