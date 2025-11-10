import { notificationTypeSchema, selectRoomSchema } from "@esposter/db-schema";
import { z } from "zod";

export const updateUserToRoomInputSchema = z.object({
  notificationType: notificationTypeSchema,
  roomId: selectRoomSchema.shape.id,
});
export type UpdateUserToRoomInput = z.infer<typeof updateUserToRoomInputSchema>;
