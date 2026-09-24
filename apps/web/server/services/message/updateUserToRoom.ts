import type { UpdateUserToRoomInput } from "#shared/models/db/userToRoom/UpdateUserToRoomInput";
import type { Context } from "@@/server/trpc/context";
import type { User } from "@esposter/db-schema";

import { userToRoomEventEmitter } from "@@/server/services/message/events/userToRoomEventEmitter";
import { getRoomMembershipWhere } from "@@/server/services/room/getRoomMembershipWhere";
import { getInvalidOperationError } from "@@/server/trpc/guards/getInvalidOperationError";
import { checkHasPermission } from "@esposter/db";
import { DatabaseEntityType, RoomPermission, usersToRoomsInMessage } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const updateUserToRoom = async (
  db: Context["db"],
  userId: User["id"],
  { roomId, targetUserId, ...rest }: UpdateUserToRoomInput,
) => {
  const effectiveUserId = targetUserId ?? userId;

  if (targetUserId && targetUserId !== userId) {
    const isPermitted = await checkHasPermission(db, userId, roomId, RoomPermission.ManageNicknames);
    if (!isPermitted) throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const updatedUserToRoom = (
    await db.update(usersToRoomsInMessage).set(rest).where(getRoomMembershipWhere(roomId, effectiveUserId)).returning()
  )[0];
  if (!updatedUserToRoom)
    throw getInvalidOperationError(Operation.Update, DatabaseEntityType.UserToRoom, JSON.stringify({ roomId }));
  userToRoomEventEmitter.emit("updateUserToRoom", updatedUserToRoom);
  return updatedUserToRoom;
};
