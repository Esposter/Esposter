import type { Context } from "#server/trpc/context";

import { requireEntity } from "#server/trpc/guards/requireEntity";
import { DatabaseEntityType } from "@esposter/db-schema";

// The member row of a user in a room, which a caller proves exists before it acts on the user's membership
export const requireUserToRoom = (db: Context["db"], roomId: string, userId: string) =>
  requireEntity(
    db.query.usersToRoomsInMessage.findFirst({
      columns: { userId: true },
      where: { roomId: { eq: roomId }, userId: { eq: userId } },
    }),
    DatabaseEntityType.UserToRoom,
    userId,
  );
