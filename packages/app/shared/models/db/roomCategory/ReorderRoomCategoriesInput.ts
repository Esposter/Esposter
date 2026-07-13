import { selectRoomCategoryInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

export const reorderRoomCategoriesInputSchema = z.array(
  selectRoomCategoryInMessageSchema.pick({ id: true, position: true }),
);
export type ReorderRoomCategoriesInput = z.infer<typeof reorderRoomCategoriesInputSchema>;
