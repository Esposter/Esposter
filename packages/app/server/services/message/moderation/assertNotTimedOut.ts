import type { Context } from "@@/server/trpc/context";

import { TRPCError } from "@trpc/server";

export const assertNotTimedOut = async (db: Context["db"], userId: string, roomId: string) => {
  const userToRoom = await db.query.usersToRooms.findFirst({
    columns: { timeoutUntil: true },
    where: (usersToRooms, { and, eq }) => and(eq(usersToRooms.userId, userId), eq(usersToRooms.roomId, roomId)),
  });
  if (userToRoom?.timeoutUntil && userToRoom.timeoutUntil > new Date()) throw new TRPCError({ code: "FORBIDDEN" });
};
