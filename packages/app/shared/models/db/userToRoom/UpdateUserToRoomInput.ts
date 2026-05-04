import { refineAtLeastOne } from "#shared/services/zod/refineAtLeastOne";
import { roomIdSchema, selectUserToRoomInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

export const updateUserToRoomInputSchema = refineAtLeastOne(
  z.object({
    ...roomIdSchema.shape,
    ...selectUserToRoomInMessageSchema.pick({ notificationType: true }).partial().shape,
    lastMessageAt: selectUserToRoomInMessageSchema.shape.lastMessageAt.unwrap().optional(),
  }),
  ["lastMessageAt", "notificationType"],
);
export type UpdateUserToRoomInput = z.infer<typeof updateUserToRoomInputSchema>;
