import type { z } from "zod";

import { refineAtLeastOne } from "#shared/services/zod/refineAtLeastOne";
import { selectPostSchema } from "@esposter/db-schema";

export const updatePostInputSchema = refineAtLeastOne(
  selectPostSchema.pick({ description: true, id: true, title: true }).partial({ description: true, title: true }),
  ["description", "title"],
);
export type UpdatePostInput = z.infer<typeof updatePostInputSchema>;
