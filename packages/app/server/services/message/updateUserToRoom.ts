import type { UpdateUserToRoomInput } from "#shared/models/db/userToRoom/UpdateUserToRoomInput";
import type { Context } from "@@/server/trpc/context";
import type { User } from "@esposter/db-schema";

import { userToRoomEventEmitter } from "@@/server/services/message/events/userToRoomEventEmitter";
import { DatabaseEntityType, usersToRoomsInMessage } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

export const updateUserToRoom = async (
  db: Context["db"],
  userId: User["id"],
  { roomId, ...rest }: UpdateUserToRoomInput,
) => {
  const updatedUserToRoom = (
    await db
      .update(usersToRoomsInMessage)
      .set(rest)
      .where(and(eq(usersToRoomsInMessage.userId, userId), eq(usersToRoomsInMessage.roomId, roomId)))
      .returning()
  )[0];
  if (!updatedUserToRoom)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: new InvalidOperationError(Operation.Update, DatabaseEntityType.UserToRoom, JSON.stringify({ roomId }))
        .message,
    });
  userToRoomEventEmitter.emit("updateUserToRoom", updatedUserToRoom);
  return updatedUserToRoom;
};
