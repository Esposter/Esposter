import type { Session } from "#shared/models/auth/Session";
import type { Context } from "@@/server/trpc/context";

import { TRPCError } from "@trpc/server";

export const isMember = async (db: Context["db"], session: Session, roomIds: string[]) => {
  const foundUsersToRooms = await db.query.usersToRoomsInMessage.findMany({
    where: {
      roomId: {
        arrayContains: roomIds,
      },
      userId: {
        eq: session.user.id,
      },
    },
  });
  if (foundUsersToRooms.length !== roomIds.length) throw new TRPCError({ code: "UNAUTHORIZED" });
};
