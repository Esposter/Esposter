import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";
import type { Context } from "@@/server/trpc/context";

import { ownedBy } from "@@/server/services/db/ownedBy";
import { roomEventEmitter } from "@@/server/services/message/events/roomEventEmitter";
import { DatabaseEntityType, roomsInMessage } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const deleteRoom = async (db: Context["db"], { session, user }: GetSessionPayload, id: string) => {
  const deletedRoom = (
    await db
      .delete(roomsInMessage)
      .where(ownedBy(roomsInMessage, id, user.id))
      .returning()
  )[0];
  if (!deletedRoom)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: new InvalidOperationError(Operation.Delete, DatabaseEntityType.Room, id).message,
    });

  roomEventEmitter.emit("deleteRoom", {
    roomId: deletedRoom.id,
    sessionId: session.id,
    userId: user.id,
  });
  return deletedRoom;
};
