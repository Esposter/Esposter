import type { z } from "zod/v4";

import { selectPostSchema } from "#shared/db/schema/posts";

export const updatePostInputSchema = selectPostSchema
  .pick({ description: true, id: true, title: true })
  .partial({ description: true, title: true })
  .refine(({ description, title }) => description !== undefined || title !== undefined);
export type UpdatePostInput = z.infer<typeof updatePostInputSchema>;
