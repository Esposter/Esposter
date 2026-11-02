import type { Transaction } from "#server/models/db/Transaction";
import type { Context } from "#server/trpc/context";
import type { UpdateUserToRoomInput } from "#shared/models/db/userToRoom/UpdateUserToRoomInput";
import type { UserInAuth, UserToRoomInMessage } from "@esposter/db-schema";

import { ownedBy } from "#server/services/db/ownedBy";
import { userToRoomEventEmitter } from "#server/services/message/events/userToRoomEventEmitter";
import { requireRoomCategory } from "#server/services/room/category/requireRoomCategory";
import { getRoomMembershipWhere } from "#server/services/room/getRoomMembershipWhere";
import { assertIsManageable } from "#server/services/room/rbac/assertIsManageable";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { checkHasPermission } from "@esposter/db";
import {
  DatabaseEntityType,
  roomCategoriesInMessage,
  RoomPermission,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

// `lastMessageAt` is the slowmode clock, so only a send stamps it — the client's input schema carries `lastReadAt`
// Instead, and a member can never move the clock its next send is checked against
export const updateUserToRoom = async (
  db: Context["db"] | Transaction,
  userId: UserInAuth["id"],
  {
    categoryId,
    roomId,
    targetUserId,
    ...rest
  }: Partial<Pick<UserToRoomInMessage, "lastMessageAt">> & UpdateUserToRoomInput,
) => {
  const effectiveUserId = targetUserId ?? userId;

  if (targetUserId && targetUserId !== userId) {
    const [isPermitted] = await Promise.all([
      checkHasPermission(db, userId, roomId, RoomPermission.ManageDisplayNames),
      assertIsManageable(db, userId, targetUserId, roomId),
    ]);
    if (!isPermitted) throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  // The foreign key proves only that the category exists, so the one named must be the caller's own, or a member could
  // File the room under another member's category
  if (categoryId) {
    const ownedRoomCategory = (
      await db
        .select()
        .from(roomCategoriesInMessage)
        .where(ownedBy(roomCategoriesInMessage, categoryId, userId))
    )[0];
    requireRoomCategory(ownedRoomCategory, Operation.Update, categoryId, "NOT_FOUND");
  }

  const updatedUserToRooms = await db
    .update(usersToRoomsInMessage)
    .set({ categoryId, ...rest })
    .where(getRoomMembershipWhere(roomId, effectiveUserId))
    .returning();
  const updatedUserToRoom = requireMutation(
    updatedUserToRooms[0],
    Operation.Update,
    DatabaseEntityType.UserToRoom,
    JSON.stringify({ roomId }),
  );
  userToRoomEventEmitter.emit("updateUserToRoom", updatedUserToRoom);
  return updatedUserToRoom;
};
