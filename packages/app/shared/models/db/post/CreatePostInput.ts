import type { z } from "zod";

import { selectPostSchema } from "#shared/db/schema/posts";

export const createPostInputSchema = selectPostSchema
  .pick({ title: true })
  .merge(selectPostSchema.partial().pick({ description: true }));
export type CreatePostInput = z.infer<typeof createPostInputSchema>;
