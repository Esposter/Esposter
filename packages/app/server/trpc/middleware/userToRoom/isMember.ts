import type { Session } from "@@/server/models/auth/Session";
import type { Context } from "@@/server/trpc/context";

import { TRPCError } from "@trpc/server";

export const isMember = async (db: Context["db"], session: Session, roomIds: string[]) => {
  const foundUsersToRooms = await db.query.usersToRooms.findMany({
    where: (usersToRooms, { and, eq, inArray }) =>
      and(eq(usersToRooms.userId, session.user.id), inArray(usersToRooms.roomId, roomIds)),
  });
  if (foundUsersToRooms.length !== roomIds.length) throw new TRPCError({ code: "UNAUTHORIZED" });
};
