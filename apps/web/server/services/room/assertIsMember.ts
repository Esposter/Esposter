import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";
import type { Context } from "@@/server/trpc/context";

import { TRPCError } from "@trpc/server";

// Deduplicated before the count: a membership row exists once per room, so a repeated id — which the search
// Filters allow, since two `in:` clauses narrow together — would otherwise read as one missing membership
export const assertIsMember = async (db: Context["db"], { user }: GetSessionPayload, roomIds: string | string[]) => {
  const roomIdArray = Array.isArray(roomIds) ? [...new Set(roomIds)] : [roomIds];
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
