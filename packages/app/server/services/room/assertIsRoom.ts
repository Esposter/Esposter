import type { Context } from "@@/server/trpc/context";

import { DatabaseEntityType, RoomType } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const assertIsRoom = async (
  db: Context["db"] | Parameters<Parameters<Context["db"]["transaction"]>[0]>[0],
  roomId: string,
  type: RoomType = RoomType.Room,
): Promise<void> => {
  const room = await db.query.roomsInMessage.findFirst({ where: { id: { eq: roomId } } });
  if (room?.type !== type)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: new InvalidOperationError(Operation.Read, DatabaseEntityType.UserToRoom, roomId).message,
    });
};
