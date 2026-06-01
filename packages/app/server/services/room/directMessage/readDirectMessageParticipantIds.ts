import type { Context } from "@@/server/trpc/context";

import { usersToRoomsInMessage } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

export const readDirectMessageParticipantIds = async (
  db: Context["db"] | Parameters<Parameters<Context["db"]["transaction"]>[0]>[0],
  roomId: string,
) =>
  (
    await db
      .select({ userId: usersToRoomsInMessage.userId })
      .from(usersToRoomsInMessage)
      .where(eq(usersToRoomsInMessage.roomId, roomId))
  ).map(({ userId }) => userId);
