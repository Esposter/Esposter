import type { Context } from "@@/server/trpc/context";
import type { RoomInMessage } from "@esposter/db-schema";

import { getDirectMessageParticipantKey } from "@@/server/services/room/directMessage/getDirectMessageParticipantKey";
import { roomsInMessage } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

export const updateDirectMessageParticipantKey = (
  db: Context["db"] | Parameters<Parameters<Context["db"]["transaction"]>[0]>[0],
  roomId: RoomInMessage["id"],
  userIds: string[],
) =>
  db
    .update(roomsInMessage)
    .set({ participantKey: getDirectMessageParticipantKey(userIds) })
    .where(eq(roomsInMessage.id, roomId))
    .returning();
