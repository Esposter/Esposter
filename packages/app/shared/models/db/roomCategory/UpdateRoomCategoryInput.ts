import type { z } from "zod";

import { refineAtLeastOne } from "#shared/services/zod/refineAtLeastOne";
import { selectRoomCategorySchema } from "@esposter/db-schema";

export const updateRoomCategoryInputSchema = refineAtLeastOne(
  selectRoomCategorySchema.pick({ id: true, name: true, position: true }).partial({ name: true, position: true }),
  ["name", "position"],
);
export type UpdateRoomCategoryInput = z.infer<typeof updateRoomCategoryInputSchema>;
