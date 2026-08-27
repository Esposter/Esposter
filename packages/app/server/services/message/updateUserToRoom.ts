import type { UpdateUserToRoomInput } from "#shared/models/db/userToRoom/UpdateUserToRoomInput";
import type { Context } from "@@/server/trpc/context";
import type { User } from "@esposter/db-schema";

import { getInvalidOperationError } from "@@/server/trpc/guards/getInvalidOperationError";
import { userToRoomEventEmitter } from "@@/server/services/message/events/userToRoomEventEmitter";
import { hasPermission } from "@esposter/db";
import { DatabaseEntityType, RoomPermission, usersToRoomsInMessage } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

export const updateUserToRoom = async (
  db: Context["db"],
  userId: User["id"],
  { roomId, targetUserId, ...rest }: UpdateUserToRoomInput,
) => {
  const effectiveUserId = targetUserId ?? userId;

  if (targetUserId && targetUserId !== userId) {
    const isPermitted = await hasPermission(db, userId, roomId, RoomPermission.ManageNicknames);
    if (!isPermitted) throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const updatedUserToRoom = (
    await db
      .update(usersToRoomsInMessage)
      .set(rest)
      .where(and(eq(usersToRoomsInMessage.userId, effectiveUserId), eq(usersToRoomsInMessage.roomId, roomId)))
      .returning()
  )[0];
  if (!updatedUserToRoom)
    throw getInvalidOperationError(Operation.Update, DatabaseEntityType.UserToRoom, JSON.stringify({ roomId }));
  userToRoomEventEmitter.emit("updateUserToRoom", updatedUserToRoom);
  return updatedUserToRoom;
};
