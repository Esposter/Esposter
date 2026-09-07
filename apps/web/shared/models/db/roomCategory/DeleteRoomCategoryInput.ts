import type { z } from "zod";

import { selectRoomCategoryInMessageSchema } from "@esposter/db-schema";

export const deleteRoomCategoryInputSchema = selectRoomCategoryInMessageSchema.shape.id;
export type DeleteRoomCategoryInput = z.infer<typeof deleteRoomCategoryInputSchema>;
