import type { z } from "zod";

import { selectPostInPostSchema } from "@esposter/db-schema";

export const createPostInputSchema = selectPostInPostSchema
  .pick({ description: true, title: true })
  .partial({ description: true });
export type CreatePostInput = z.infer<typeof createPostInputSchema>;
