import { notificationTypeSchema, roomIdSchema } from "@esposter/db-schema";
import { z } from "zod";

export const updateUserToRoomInputSchema = z.object({
  ...roomIdSchema.shape,
  notificationType: notificationTypeSchema,
});
export type UpdateUserToRoomInput = z.infer<typeof updateUserToRoomInputSchema>;
