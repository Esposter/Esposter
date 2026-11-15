import type { AuthedContext } from "#server/models/auth/AuthedContext";

import { inJsonArray } from "@esposter/db";
import { usersToRoomsInMessage } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

// Deduplicated before the count: a membership row exists once per room, so a repeated id — which the search
// Filters allow, since two `in:` clauses narrow together — would otherwise read as one missing membership
export const assertIsMember = async ({ db, user }: Pick<AuthedContext, "db" | "user">, roomIds: string | string[]) => {
  const roomIdArray = Array.isArray(roomIds) ? [...new Set(roomIds)] : [roomIds];
  const foundUsersToRooms = await db
    .select({ roomId: usersToRoomsInMessage.roomId })
    .from(usersToRoomsInMessage)
    .where(and(eq(usersToRoomsInMessage.userId, user.id), inJsonArray(usersToRoomsInMessage.roomId, roomIdArray)));
  if (foundUsersToRooms.length !== roomIdArray.length) throw new TRPCError({ code: "UNAUTHORIZED" });
};
