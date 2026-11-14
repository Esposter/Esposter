import { refineAtLeastOne, roomIdSchema, selectUserToRoomInMessageSchema, userIdSchema } from "@esposter/db-schema";
import { z } from "zod";

const updatableUserToRoomSchema = z.object({
  ...selectUserToRoomInMessageSchema.pick({ categoryId: true, displayName: true, notificationType: true }).partial()
    .shape,
  lastReadAt: selectUserToRoomInMessageSchema.shape.lastReadAt.unwrap().optional(),
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
    (data.displayName !== undefined &&
      data.categoryId === undefined &&
      data.notificationType === undefined &&
      data.lastReadAt === undefined),
  { error: "targetUserId requires displayName and must not include categoryId, notificationType or lastReadAt" },
);
export type UpdateUserToRoomInput = z.infer<typeof updateUserToRoomInputSchema>;
