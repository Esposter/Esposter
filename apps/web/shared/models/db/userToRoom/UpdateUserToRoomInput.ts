import { refineAtLeastOne } from "#shared/services/zod/refineAtLeastOne";
import { roomIdSchema, selectUserToRoomInMessageSchema, userIdSchema } from "@esposter/db-schema";
import { z } from "zod";

const updatableUserToRoomSchema = z.object({
  ...selectUserToRoomInMessageSchema.pick({ nickname: true, notificationType: true }).partial().shape,
  lastMessageAt: selectUserToRoomInMessageSchema.shape.lastMessageAt.unwrap().optional(),
});

export const updateUserToRoomInputSchema = refineAtLeastOne(
  z.object({
    ...roomIdSchema.shape,
    ...updatableUserToRoomSchema.shape,
    targetUserId: userIdSchema.shape.userId.optional(),
  }),
  updatableUserToRoomSchema.keyof().options,
).refine(
  (data) =>
    !data.targetUserId ||
    (data.nickname !== undefined && data.notificationType === undefined && data.lastMessageAt === undefined),
  { error: "targetUserId requires nickname and must not include notificationType or lastMessageAt" },
);
export type UpdateUserToRoomInput = z.infer<typeof updateUserToRoomInputSchema>;
