import type { z } from "zod";

import { selectPostSchema } from "@esposter/db";

export const createPostInputSchema = selectPostSchema
  .pick({ description: true, title: true })
  .partial({ description: true });
export type CreatePostInput = z.infer<typeof createPostInputSchema>;
