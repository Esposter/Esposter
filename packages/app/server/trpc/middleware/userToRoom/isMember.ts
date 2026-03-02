import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";
import type { Context } from "@@/server/trpc/context";

import { TRPCError } from "@trpc/server";

export const isMember = async (db: Context["db"], { user }: GetSessionPayload, roomIds: string[]) => {
  const foundUsersToRooms = await db.query.usersToRooms.findMany({
    where: (usersToRooms, { and, eq, inArray }) =>
      and(eq(usersToRooms.userId, user.id), inArray(usersToRooms.roomId, roomIds)),
  });
  if (foundUsersToRooms.length !== roomIds.length) throw new TRPCError({ code: "UNAUTHORIZED" });
};
