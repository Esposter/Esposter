import { notificationTypeSchema, selectRoomInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

export const updateUserToRoomInputSchema = z.object({
  notificationType: notificationTypeSchema,
  roomId: selectRoomInMessageSchema.shape.id,
});
export type UpdateUserToRoomInput = z.infer<typeof updateUserToRoomInputSchema>;
