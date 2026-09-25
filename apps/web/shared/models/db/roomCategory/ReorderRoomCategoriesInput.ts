import type { z } from "zod";

import { selectRoomCategoryInMessageSchema } from "@esposter/db-schema";
import { createUniqueArraySchema, MAX_READ_LIMIT } from "@esposter/shared";

// The reorder is one CASE over the batch, bounded exactly like every other batched read/write; the same category
// Twice would give the CASE two answers for one row, the first of which silently wins
export const reorderRoomCategoriesInputSchema = createUniqueArraySchema(
  selectRoomCategoryInMessageSchema.pick({ id: true, position: true }),
  "id",
)
  .min(1)
  .max(MAX_READ_LIMIT);
export type ReorderRoomCategoriesInput = z.infer<typeof reorderRoomCategoriesInputSchema>;
