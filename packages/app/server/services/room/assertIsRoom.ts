import type { Context } from "@@/server/trpc/context";

import { DatabaseEntityType, RoomType } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const assertIsRoom = async (
  db: Context["db"] | Parameters<Parameters<Context["db"]["transaction"]>[0]>[0],
  roomId: string,
): Promise<void> => {
  const room = await db.query.rooms.findFirst({ where: (rooms, { eq }) => eq(rooms.id, roomId) });
  if (room?.type !== RoomType.Room)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: new InvalidOperationError(Operation.Create, DatabaseEntityType.UserToRoom, roomId).message,
    });
};
