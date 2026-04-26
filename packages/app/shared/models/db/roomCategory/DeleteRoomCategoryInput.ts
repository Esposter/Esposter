import type { z } from "zod";

import { selectRoomCategorySchema } from "@esposter/db-schema";

export const deleteRoomCategoryInputSchema = selectRoomCategorySchema.shape.id;
export type DeleteRoomCategoryInput = z.infer<typeof deleteRoomCategoryInputSchema>;
