import type { UpdateUserToRoomInput } from "#shared/models/db/userToRoom/UpdateUserToRoomInput";
import type { Context } from "@@/server/trpc/context";
import type { User, UserToRoomInMessage } from "@esposter/db-schema";

import { userToRoomEventEmitter } from "@@/server/services/message/events/userToRoomEventEmitter";
import { getRoomMembershipWhere } from "@@/server/services/room/getRoomMembershipWhere";
import { getInvalidOperationError } from "@@/server/trpc/guards/getInvalidOperationError";
import { checkHasPermission } from "@esposter/db";
import { DatabaseEntityType, RoomPermission, usersToRoomsInMessage } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

// `lastMessageAt` is the slowmode clock, so only a send stamps it — the client's input schema carries `lastReadAt`
// Instead, and a member can never move the clock its next send is checked against
export const updateUserToRoom = async (
  db: Context["db"],
  userId: User["id"],
  { roomId, targetUserId, ...rest }: Partial<Pick<UserToRoomInMessage, "lastMessageAt">> & UpdateUserToRoomInput,
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
