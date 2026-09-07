import { refineAtLeastOne } from "#shared/services/zod/refineAtLeastOne";
import { selectRoomCategoryInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

const updatableRoomCategorySchema = selectRoomCategoryInMessageSchema.pick({ name: true, position: true });

export const updateRoomCategoryInputSchema = refineAtLeastOne(
  z.object({
    ...selectRoomCategoryInMessageSchema.pick({ id: true }).shape,
    ...updatableRoomCategorySchema.partial().shape,
  }),
  updatableRoomCategorySchema.keyof().options,
);
export type UpdateRoomCategoryInput = z.infer<typeof updateRoomCategoryInputSchema>;
