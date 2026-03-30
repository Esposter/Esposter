import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";
import type { Context } from "@@/server/trpc/context";

import { TRPCError } from "@trpc/server";

export const isMember = async (db: Context["db"], { user }: GetSessionPayload, roomIds: string[]) => {
  const foundUsersToRooms = await db.query.usersToRoomsInMessage.findMany({
    where: {
      roomId: {
        arrayContains: roomIds,
      },
      userId: {
        eq: user.id,
      },
    },
  });
  if (foundUsersToRooms.length !== roomIds.length) throw new TRPCError({ code: "UNAUTHORIZED" });
};
