import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";
import type { Context } from "@@/server/trpc/context";

import { TRPCError } from "@trpc/server";

export const isMember = async (db: Context["db"], { user }: GetSessionPayload, roomIds: string | string[]) => {
  const roomIdArray = Array.isArray(roomIds) ? roomIds : [roomIds];
  const foundUsersToRooms = await db.query.usersToRoomsInMessage.findMany({
    where: {
      roomId: {
        in: roomIdArray,
      },
      userId: {
        eq: user.id,
      },
    },
  });
  if (foundUsersToRooms.length !== roomIdArray.length) throw new TRPCError({ code: "UNAUTHORIZED" });
};
