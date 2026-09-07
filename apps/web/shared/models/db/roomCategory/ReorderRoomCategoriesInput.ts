import type { z } from "zod";

import { selectRoomCategoryInMessageSchema } from "@esposter/db-schema";
import { createUniqueArraySchema, MAX_READ_LIMIT } from "@esposter/shared";

// One UPDATE per element runs inside the reorder transaction, so the batch is bounded exactly like every
// Other batched read/write; the same category twice would issue two writes whose order decides the winner
export const reorderRoomCategoriesInputSchema = createUniqueArraySchema(
  selectRoomCategoryInMessageSchema.pick({ id: true, position: true }),
  "id",
)
  .min(1)
  .max(MAX_READ_LIMIT);
export type ReorderRoomCategoriesInput = z.infer<typeof reorderRoomCategoriesInputSchema>;
