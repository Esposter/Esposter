import type { Session } from "#shared/models/auth/Session";
import type { Context } from "@@/server/trpc/context";

import { roomEventEmitter } from "@@/server/services/message/events/roomEventEmitter";
import { DatabaseEntityType, roomsInMessage } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

export const deleteRoom = async (db: Context["db"], session: Session, id: string) => {
  const deletedRoom = (
    await db
      .delete(roomsInMessage)
      .where(and(eq(roomsInMessage.id, id), eq(roomsInMessage.userId, session.user.id)))
      .returning()
  ).find(Boolean);
  if (!deletedRoom)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: new InvalidOperationError(Operation.Delete, DatabaseEntityType.Room, id).message,
    });

  roomEventEmitter.emit("deleteRoom", {
    roomId: deletedRoom.id,
    sessionId: session.session.id,
    userId: session.user.id,
  });
  return deletedRoom;
};
