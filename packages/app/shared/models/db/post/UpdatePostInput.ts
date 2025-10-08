import type { z } from "zod";

import { selectPostSchema } from "@esposter/db";

export const updatePostInputSchema = selectPostSchema
  .pick({ description: true, id: true, title: true })
  .partial({ description: true, title: true })
  .refine(({ description, title }) => description !== undefined || title !== undefined);
export type UpdatePostInput = z.infer<typeof updatePostInputSchema>;
