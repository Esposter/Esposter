import type { Context } from "@@/server/trpc/context";

import { TRPCError } from "@trpc/server";

export const assertNotTimedOut = async (db: Context["db"], userId: string, roomId: string) => {
  const userToRoom = await db.query.usersToRoomsInMessage.findFirst({
    columns: { timeoutUntil: true },
    where: { userId: { eq: userId }, roomId: { eq: roomId } },
  });
  if (userToRoom?.timeoutUntil && userToRoom.timeoutUntil > new Date()) throw new TRPCError({ code: "FORBIDDEN" });
};
