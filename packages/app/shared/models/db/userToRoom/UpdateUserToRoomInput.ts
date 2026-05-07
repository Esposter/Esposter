import { refineAtLeastOne } from "#shared/services/zod/refineAtLeastOne";
import { roomIdSchema, selectUserToRoomInMessageSchema, userIdSchema } from "@esposter/db-schema";
import { z } from "zod";

export const updateUserToRoomInputSchema = refineAtLeastOne(
  z.object({
    ...roomIdSchema.shape,
    ...selectUserToRoomInMessageSchema.pick({ nickname: true, notificationType: true }).partial().shape,
    lastMessageAt: selectUserToRoomInMessageSchema.shape.lastMessageAt.unwrap().optional(),
    targetUserId: userIdSchema.shape.userId.optional(),
  }),
  ["lastMessageAt", "nickname", "notificationType"],
).refine(
  (data) =>
    !data.targetUserId ||
    (data.nickname !== undefined && data.notificationType === undefined && data.lastMessageAt === undefined),
  { message: "targetUserId can only be used with nickname" },
);
export type UpdateUserToRoomInput = z.infer<typeof updateUserToRoomInputSchema>;
