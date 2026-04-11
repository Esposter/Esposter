import type { z } from "zod";

import { selectRoomCategorySchema } from "@esposter/db-schema";

export const updateRoomCategoryInputSchema = selectRoomCategorySchema
  .pick({ id: true, name: true, position: true })
  .partial({ name: true, position: true });
export type UpdateRoomCategoryInput = z.infer<typeof updateRoomCategoryInputSchema>;
